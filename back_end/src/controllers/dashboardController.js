/**
 * Dashboard Controller
 * Provides dashboard data for students and teachers/admins
 */

const { User, Session, Attendance, Assignment, Submission, Announcement, Agenda } = require('../models');
const { asyncHandler } = require('../middleware');

/**
 * @desc    Get student dashboard data
 * @route   GET /api/v1/dashboard/student
 * @access  Private (Student)
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // Parallel fetch all dashboard data
  const [
    attendanceSummary,
    pendingAssignments,
    recentSubmissions,
    recentAnnouncements,
    upcomingAgendas
  ] = await Promise.all([
    // Attendance summary
    Attendance.getUserSummary(userId),
    
    // Pending assignments (not submitted)
    (async () => {
      const assignments = await Assignment.find({
        isPublished: true,
        dueDate: { $gte: new Date() }
      }).select('_id');
      
      const submittedIds = await Submission.find({
        student: userId,
        assignment: { $in: assignments.map(a => a._id) }
      }).distinct('assignment');
      
      return Assignment.find({
        _id: { $in: assignments.map(a => a._id) },
        _id: { $nin: submittedIds }
      })
        .select('title dueDate points')
        .sort({ dueDate: 1 })
        .limit(5);
    })(),
    
    // Recent submissions
    Submission.find({ student: userId })
      .populate('assignment', 'title points')
      .sort({ submittedAt: -1 })
      .limit(5),
    
    // Recent announcements
    Announcement.getForUser(req.user, { limit: 5 }),
    
    // Upcoming events
    Agenda.find({
      isPublished: true,
      date: { $gte: new Date() }
    })
      .select('topic date startTime location speaker')
      .sort({ date: 1 })
      .limit(3)
  ]);
  
  // Calculate assignment stats
  const allSubmissions = await Submission.find({ student: userId });
  const gradedSubmissions = allSubmissions.filter(s => s.status === 'graded');
  const averageScore = gradedSubmissions.length > 0
    ? Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / gradedSubmissions.length)
    : null;
  
  res.status(200).json({
    success: true,
    data: {
      attendance: attendanceSummary,
      assignments: {
        pending: pendingAssignments,
        recentSubmissions,
        stats: {
          total: allSubmissions.length,
          graded: gradedSubmissions.length,
          averageScore
        }
      },
      announcements: recentAnnouncements,
      upcomingEvents: upcomingAgendas
    }
  });
});

/**
 * @desc    Get teacher/admin dashboard data
 * @route   GET /api/v1/dashboard/teacher
 * @access  Private (Teacher/Admin)
 */
const getTeacherDashboard = asyncHandler(async (req, res) => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [
    memberStats,
    recentSessions,
    assignmentStats,
    recentAnnouncements,
    upcomingAgendas,
    attendanceOverview
  ] = await Promise.all([
    // Member stats
    (async () => {
      const [students, teachers, admins] = await Promise.all([
        User.countDocuments({ role: 'student', isActive: true }),
        User.countDocuments({ role: 'teacher', isActive: true }),
        User.countDocuments({ role: 'admin', isActive: true })
      ]);
      return { students, teachers, admins, total: students + teachers + admins };
    })(),
    
    // Recent sessions
    Session.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ date: -1 })
      .limit(5),
    
    // Assignment stats
    (async () => {
      const assignments = await Assignment.find({ isPublished: true });
      const submissions = await Submission.find({
        assignment: { $in: assignments.map(a => a._id) }
      });
      
      const pendingGrading = submissions.filter(s => 
        s.status === 'submitted' || s.status === 'late'
      ).length;
      
      return {
        total: assignments.length,
        submissions: submissions.length,
        pendingGrading,
        graded: submissions.filter(s => s.status === 'graded').length
      };
    })(),
    
    // Recent announcements
    Announcement.find({ isPublished: true })
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5),
    
    // Upcoming events
    Agenda.find({
      isPublished: true,
      date: { $gte: new Date() }
    })
      .select('topic date startTime location speaker registeredAttendees')
      .sort({ date: 1 })
      .limit(5),
    
    // Attendance overview (last 30 days)
    (async () => {
      const sessions = await Session.find({
        isActive: true,
        date: { $gte: thirtyDaysAgo }
      });
      
      if (sessions.length === 0) {
        return { averageAttendance: 0, totalSessions: 0 };
      }
      
      const sessionIds = sessions.map(s => s._id);
      const attendanceRecords = await Attendance.find({
        session: { $in: sessionIds }
      });
      
      const presentCount = attendanceRecords.filter(
        a => a.status === 'present' || a.status === 'late'
      ).length;
      const totalRecords = attendanceRecords.length;
      
      return {
        averageAttendance: totalRecords > 0 
          ? Math.round((presentCount / totalRecords) * 100) 
          : 0,
        totalSessions: sessions.length,
        totalRecords
      };
    })()
  ]);
  
  // Add attendance summary to recent sessions
  const sessionsWithAttendance = await Promise.all(
    recentSessions.map(async (session) => {
      const summary = await Attendance.getSessionSummary(session._id);
      return {
        ...session.toObject(),
        attendanceSummary: summary
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: {
      members: memberStats,
      sessions: sessionsWithAttendance,
      assignments: assignmentStats,
      announcements: recentAnnouncements,
      upcomingEvents: upcomingAgendas,
      attendance: attendanceOverview
    }
  });
});

/**
 * @desc    Get admin analytics
 * @route   GET /api/v1/dashboard/analytics
 * @access  Private (Admin)
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  // Members by month
  const membersByMonth = await User.aggregate([
    {
      $match: {
        isActive: true,
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Submissions by status
  const submissionsByStatus = await Submission.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Attendance trends
  const attendanceTrends = await Attendance.aggregate([
    {
      $lookup: {
        from: 'sessions',
        localField: 'session',
        foreignField: '_id',
        as: 'sessionData'
      }
    },
    { $unwind: '$sessionData' },
    {
      $group: {
        _id: {
          year: { $year: '$sessionData.date' },
          month: { $month: '$sessionData.date' },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Top performers (by average score)
  const topPerformers = await Submission.aggregate([
    { $match: { status: 'graded' } },
    {
      $group: {
        _id: '$student',
        averageScore: { $avg: '$score' },
        totalSubmissions: { $sum: 1 }
      }
    },
    { $sort: { averageScore: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    { $unwind: '$student' },
    {
      $project: {
        name: '$student.name',
        email: '$student.email',
        averageScore: { $round: ['$averageScore', 1] },
        totalSubmissions: 1
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    data: {
      memberGrowth: membersByMonth,
      submissionStats: submissionsByStatus,
      attendanceTrends,
      topPerformers
    }
  });
});

module.exports = {
  getStudentDashboard,
  getTeacherDashboard,
  getAnalytics
};
