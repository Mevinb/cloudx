/**
 * Attendance Controller
 * Handles attendance tracking and management
 */

const { Attendance, Session, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware');
const { createObjectCsvStringifier } = require('csv-writer');

/**
 * @desc    Get attendance for a session
 * @route   GET /api/v1/attendance/session/:sessionId
 * @access  Private
 */
const getSessionAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  const attendance = await Attendance.find({ session: sessionId })
    .populate('user', 'name email batch')
    .populate('markedBy', 'name')
    .sort({ 'user.name': 1 });
  
  const summary = await Attendance.getSessionSummary(sessionId);
  
  res.status(200).json({
    success: true,
    data: {
      session: {
        _id: session._id,
        title: session.title,
        date: session.date
      },
      attendance,
      summary
    }
  });
});

/**
 * @desc    Get attendance for a user
 * @route   GET /api/v1/attendance/user/:userId
 * @access  Private
 */
const getUserAttendance = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  // Check if user can access this data
  if (req.user.role === 'student' && req.user._id.toString() !== userId) {
    throw new AppError('Not authorized to view this data', 403);
  }
  
  const attendance = await Attendance.find({ user: userId })
    .populate('session', 'title date startTime endTime type')
    .sort({ createdAt: -1 });
  
  const summary = await Attendance.getUserSummary(userId);
  
  res.status(200).json({
    success: true,
    data: {
      attendance,
      summary
    }
  });
});

/**
 * @desc    Mark attendance for a single user
 * @route   POST /api/v1/attendance/mark
 * @access  Private (Teacher/Admin)
 */
const markAttendance = asyncHandler(async (req, res) => {
  const { sessionId, userId, status, notes } = req.body;
  
  // Verify session exists
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  
  // Find or create attendance record
  let attendance = await Attendance.findOne({
    session: sessionId,
    user: userId
  });
  
  if (attendance) {
    // Update existing
    attendance.status = status;
    attendance.markedBy = req.user._id;
    attendance.notes = notes;
    attendance.method = 'manual';
    
    if (status === 'present' || status === 'late') {
      attendance.checkInTime = attendance.checkInTime || new Date();
    }
  } else {
    // Create new
    attendance = new Attendance({
      session: sessionId,
      user: userId,
      status,
      markedBy: req.user._id,
      notes,
      method: 'manual',
      checkInTime: (status === 'present' || status === 'late') ? new Date() : null
    });
  }
  
  await attendance.save();
  await attendance.populate('user', 'name email');
  
  res.status(200).json({
    success: true,
    message: 'Attendance marked successfully',
    data: attendance
  });
});

/**
 * @desc    Mark attendance in bulk
 * @route   POST /api/v1/attendance/bulk
 * @access  Private (Teacher/Admin)
 */
const bulkMarkAttendance = asyncHandler(async (req, res) => {
  const { sessionId, attendance } = req.body;
  
  // Verify session exists
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  const results = await Promise.all(
    attendance.map(async ({ userId, status, notes }) => {
      try {
        let record = await Attendance.findOne({
          session: sessionId,
          user: userId
        });
        
        if (record) {
          record.status = status;
          record.markedBy = req.user._id;
          record.notes = notes;
          record.method = 'manual';
          if (status === 'present' || status === 'late') {
            record.checkInTime = record.checkInTime || new Date();
          }
        } else {
          record = new Attendance({
            session: sessionId,
            user: userId,
            status,
            markedBy: req.user._id,
            notes,
            method: 'manual',
            checkInTime: (status === 'present' || status === 'late') ? new Date() : null
          });
        }
        
        await record.save();
        return { userId, success: true };
      } catch (error) {
        return { userId, success: false, error: error.message };
      }
    })
  );
  
  const summary = await Attendance.getSessionSummary(sessionId);
  
  res.status(200).json({
    success: true,
    message: 'Bulk attendance marked',
    data: {
      results,
      summary
    }
  });
});

/**
 * @desc    Self check-in for a session
 * @route   POST /api/v1/attendance/checkin/:sessionId
 * @access  Private
 */
const selfCheckIn = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  // Check if session is today
  const today = new Date();
  const sessionDate = new Date(session.date);
  if (sessionDate.toDateString() !== today.toDateString()) {
    throw new AppError('Can only check in on the session day', 400);
  }
  
  let attendance = await Attendance.findOne({
    session: sessionId,
    user: req.user._id
  });
  
  if (attendance && attendance.status === 'present') {
    throw new AppError('Already checked in', 400);
  }
  
  const checkInTime = new Date();
  
  // Determine if late based on session start time
  const [hours, minutes] = session.startTime.split(':');
  const sessionStart = new Date(session.date);
  sessionStart.setHours(parseInt(hours), parseInt(minutes), 0);
  
  const isLate = checkInTime > new Date(sessionStart.getTime() + 15 * 60000); // 15 min grace
  
  if (attendance) {
    attendance.status = isLate ? 'late' : 'present';
    attendance.checkInTime = checkInTime;
    attendance.method = 'self';
  } else {
    attendance = new Attendance({
      session: sessionId,
      user: req.user._id,
      status: isLate ? 'late' : 'present',
      checkInTime,
      method: 'self'
    });
  }
  
  await attendance.save();
  
  res.status(200).json({
    success: true,
    message: isLate ? 'Checked in (late)' : 'Checked in successfully',
    data: attendance
  });
});

/**
 * @desc    Export attendance as CSV
 * @route   GET /api/v1/attendance/export/:sessionId
 * @access  Private (Teacher/Admin)
 */
const exportAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  const attendance = await Attendance.find({ session: sessionId })
    .populate('user', 'name email batch')
    .sort({ 'user.name': 1 });
  
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'Name' },
      { id: 'email', title: 'Email' },
      { id: 'batch', title: 'Batch' },
      { id: 'status', title: 'Status' },
      { id: 'checkInTime', title: 'Check-in Time' },
      { id: 'notes', title: 'Notes' }
    ]
  });
  
  const records = attendance.map(a => ({
    name: a.user?.name || 'Unknown',
    email: a.user?.email || '',
    batch: a.user?.batch || '',
    status: a.status,
    checkInTime: a.checkInTime ? a.checkInTime.toISOString() : '',
    notes: a.notes || ''
  }));
  
  const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=attendance-${session.title.replace(/\s+/g, '-')}-${session.date.toISOString().split('T')[0]}.csv`);
  
  res.status(200).send(csvContent);
});

/**
 * @desc    Get attendance summary/analytics
 * @route   GET /api/v1/attendance/analytics
 * @access  Private (Teacher/Admin)
 */
const getAttendanceAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  
  // Get session IDs within date range
  const sessionQuery = { isActive: true };
  if (Object.keys(dateFilter).length > 0) {
    sessionQuery.date = dateFilter;
  }
  
  const sessions = await Session.find(sessionQuery).select('_id');
  const sessionIds = sessions.map(s => s._id);
  
  // Overall stats
  const overallStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Per session stats
  const perSessionStats = await Attendance.aggregate([
    { $match: { session: { $in: sessionIds } } },
    {
      $group: {
        _id: { session: '$session', status: '$status' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Average attendance rate
  const totalRecords = overallStats.reduce((sum, s) => sum + s.count, 0);
  const presentCount = overallStats.find(s => s._id === 'present')?.count || 0;
  const lateCount = overallStats.find(s => s._id === 'late')?.count || 0;
  
  const attendanceRate = totalRecords > 0 
    ? Math.round(((presentCount + lateCount) / totalRecords) * 100) 
    : 0;
  
  res.status(200).json({
    success: true,
    data: {
      overall: overallStats,
      bySession: perSessionStats,
      summary: {
        totalSessions: sessions.length,
        totalRecords,
        presentCount,
        lateCount,
        absentCount: overallStats.find(s => s._id === 'absent')?.count || 0,
        attendanceRate
      }
    }
  });
});

module.exports = {
  getSessionAttendance,
  getUserAttendance,
  markAttendance,
  bulkMarkAttendance,
  selfCheckIn,
  exportAttendance,
  getAttendanceAnalytics
};
