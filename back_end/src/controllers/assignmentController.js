/**
 * Assignment Controller
 * Handles assignment and submission management
 */

const { Assignment, Submission, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all assignments
 * @route   GET /api/v1/assignments
 * @access  Private
 */
const getAssignments = asyncHandler(async (req, res) => {
  const { status, topic, page = 1, limit = 20 } = req.query;
  
  const query = { isPublished: true };
  
  if (topic) {
    query.topic = { $regex: topic, $options: 'i' };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let assignments = await Assignment.find(query)
    .populate('createdBy', 'name')
    .sort({ dueDate: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  // For students, add their submission status
  if (req.user.role === 'student') {
    const submissions = await Submission.find({
      student: req.user._id,
      assignment: { $in: assignments.map(a => a._id) }
    });
    
    const submissionMap = {};
    submissions.forEach(s => {
      submissionMap[s.assignment.toString()] = s;
    });
    
    assignments = assignments.map(a => ({
      ...a.toObject(),
      submission: submissionMap[a._id.toString()] || null
    }));
    
    // Filter by status if requested
    if (status) {
      if (status === 'pending') {
        assignments = assignments.filter(a => !a.submission);
      } else if (status === 'submitted') {
        assignments = assignments.filter(a => a.submission?.status === 'submitted' || a.submission?.status === 'late');
      } else if (status === 'graded') {
        assignments = assignments.filter(a => a.submission?.status === 'graded');
      }
    }
  }
  
  const total = await Assignment.countDocuments(query);
  
  res.status(200).json({
    success: true,
    data: assignments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get assignment by ID
 * @route   GET /api/v1/assignments/:id
 * @access  Private
 */
const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  
  let submission = null;
  if (req.user.role === 'student') {
    submission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      ...assignment.toObject(),
      submission
    }
  });
});

/**
 * @desc    Create assignment
 * @route   POST /api/v1/assignments
 * @access  Private (Teacher/Admin)
 */
const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    instructions,
    dueDate,
    points,
    topic,
    submissionType,
    allowLateSubmission,
    lateSubmissionPenalty,
    maxLateDay
  } = req.body;
  
  const assignment = await Assignment.create({
    title,
    description,
    instructions,
    dueDate,
    points,
    topic,
    submissionType,
    allowLateSubmission,
    lateSubmissionPenalty,
    maxLateDay,
    createdBy: req.user._id
  });
  
  await assignment.populate('createdBy', 'name');
  
  res.status(201).json({
    success: true,
    message: 'Assignment created successfully',
    data: assignment
  });
});

/**
 * @desc    Update assignment
 * @route   PUT /api/v1/assignments/:id
 * @access  Private (Teacher/Admin)
 */
const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  
  const allowedUpdates = [
    'title',
    'description',
    'instructions',
    'dueDate',
    'points',
    'topic',
    'submissionType',
    'allowLateSubmission',
    'lateSubmissionPenalty',
    'maxLateDay',
    'isPublished'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      assignment[field] = req.body[field];
    }
  });
  
  await assignment.save();
  await assignment.populate('createdBy', 'name');
  
  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully',
    data: assignment
  });
});

/**
 * @desc    Delete assignment
 * @route   DELETE /api/v1/assignments/:id
 * @access  Private (Admin)
 */
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  
  // Delete related submissions
  await Submission.deleteMany({ assignment: assignment._id });
  
  await Assignment.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

/**
 * @desc    Submit assignment
 * @route   POST /api/v1/assignments/:id/submit
 * @access  Private (Student)
 */
const submitAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  
  const { content, submissionLink } = req.body;
  
  // Check if past deadline
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  const isLate = now > dueDate;
  
  if (isLate && !assignment.allowLateSubmission) {
    throw new AppError('Assignment deadline has passed', 400);
  }
  
  if (isLate) {
    const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    if (daysLate > assignment.maxLateDay) {
      throw new AppError(`Cannot submit more than ${assignment.maxLateDay} days late`, 400);
    }
  }
  
  // Check for existing submission
  let submission = await Submission.findOne({
    assignment: assignment._id,
    student: req.user._id
  });
  
  if (submission) {
    // Save previous submission
    submission.previousSubmissions.push({
      content: submission.content,
      link: submission.submissionLink,
      files: submission.files,
      submittedAt: submission.submittedAt
    });
    
    submission.content = content;
    submission.submissionLink = submissionLink;
    submission.submittedAt = now;
    submission.status = isLate ? 'late' : 'submitted';
    submission.isLate = isLate;
    submission.resubmissionCount += 1;
  } else {
    submission = new Submission({
      assignment: assignment._id,
      student: req.user._id,
      content,
      submissionLink,
      submittedAt: now,
      status: isLate ? 'late' : 'submitted',
      isLate
    });
  }
  
  await submission.save();
  
  res.status(200).json({
    success: true,
    message: isLate ? 'Assignment submitted (late)' : 'Assignment submitted successfully',
    data: submission
  });
});

/**
 * @desc    Get submissions for an assignment
 * @route   GET /api/v1/assignments/:id/submissions
 * @access  Private (Teacher/Admin)
 */
const getSubmissions = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  
  if (!assignment) {
    throw new AppError('Assignment not found', 404);
  }
  
  const submissions = await Submission.find({ assignment: assignment._id })
    .populate('student', 'name email batch')
    .populate('gradedBy', 'name')
    .sort({ submittedAt: -1 });
  
  // Get students who haven't submitted
  const submittedStudentIds = submissions.map(s => s.student._id.toString());
  const students = await User.find({
    role: 'student',
    isActive: true,
    _id: { $nin: submittedStudentIds }
  }).select('name email batch');
  
  res.status(200).json({
    success: true,
    data: {
      assignment: {
        _id: assignment._id,
        title: assignment.title,
        dueDate: assignment.dueDate,
        points: assignment.points
      },
      submissions,
      notSubmitted: students,
      stats: {
        total: submissions.length + students.length,
        submitted: submissions.length,
        graded: submissions.filter(s => s.status === 'graded').length,
        pending: students.length
      }
    }
  });
});

/**
 * @desc    Grade submission
 * @route   PUT /api/v1/submissions/:id/grade
 * @access  Private (Teacher/Admin)
 */
const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id)
    .populate('assignment');
  
  if (!submission) {
    throw new AppError('Submission not found', 404);
  }
  
  const { score, feedback } = req.body;
  
  if (score > submission.assignment.points) {
    throw new AppError(`Score cannot exceed ${submission.assignment.points} points`, 400);
  }
  
  submission.score = score;
  submission.feedback = feedback;
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();
  submission.status = 'graded';
  
  await submission.save();
  await submission.populate('student', 'name email');
  await submission.populate('gradedBy', 'name');
  
  res.status(200).json({
    success: true,
    message: 'Submission graded successfully',
    data: submission
  });
});

/**
 * @desc    Get student's submission
 * @route   GET /api/v1/assignments/:id/my-submission
 * @access  Private (Student)
 */
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id
  }).populate('gradedBy', 'name');
  
  res.status(200).json({
    success: true,
    data: submission
  });
});

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
  getMySubmission
};
