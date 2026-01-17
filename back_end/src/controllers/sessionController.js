/**
 * Session Controller
 * Handles session/meeting management
 */

const { Session, Attendance, User } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all sessions
 * @route   GET /api/v1/sessions
 * @access  Private
 */
const getSessions = asyncHandler(async (req, res) => {
  const { type, upcoming, page = 1, limit = 20 } = req.query;
  
  const query = { isActive: true };
  
  if (type) {
    query.type = type;
  }
  
  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  } else if (upcoming === 'false') {
    query.date = { $lt: new Date() };
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [sessions, total] = await Promise.all([
    Session.find(query)
      .populate('createdBy', 'name email')
      .populate('agenda')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Session.countDocuments(query)
  ]);
  
  // Add attendance summary for each session
  const sessionsWithAttendance = await Promise.all(
    sessions.map(async (session) => {
      const summary = await Attendance.getSessionSummary(session._id);
      return {
        ...session.toObject(),
        attendanceSummary: summary
      };
    })
  );
  
  res.status(200).json({
    success: true,
    data: sessionsWithAttendance,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get session by ID
 * @route   GET /api/v1/sessions/:id
 * @access  Private
 */
const getSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('agenda')
    .populate('registeredUsers', 'name email batch');
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  // Get attendance summary
  const attendanceSummary = await Attendance.getSessionSummary(session._id);
  
  res.status(200).json({
    success: true,
    data: {
      ...session.toObject(),
      attendanceSummary
    }
  });
});

/**
 * @desc    Create session
 * @route   POST /api/v1/sessions
 * @access  Private (Teacher/Admin)
 */
const createSession = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    type,
    maxCapacity
  } = req.body;
  
  const session = await Session.create({
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    type,
    maxCapacity,
    createdBy: req.user._id
  });
  
  // Initialize attendance records for all active students
  const students = await User.find({ role: 'student', isActive: true });
  
  const attendanceRecords = students.map(student => ({
    user: student._id,
    session: session._id,
    status: 'absent',
    markedBy: req.user._id,
    method: 'auto'
  }));
  
  if (attendanceRecords.length > 0) {
    await Attendance.insertMany(attendanceRecords);
  }
  
  await session.populate('createdBy', 'name email');
  
  res.status(201).json({
    success: true,
    message: 'Session created successfully',
    data: session
  });
});

/**
 * @desc    Update session
 * @route   PUT /api/v1/sessions/:id
 * @access  Private (Teacher/Admin)
 */
const updateSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  const allowedUpdates = [
    'title',
    'description',
    'date',
    'startTime',
    'endTime',
    'location',
    'type',
    'maxCapacity',
    'isActive'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      session[field] = req.body[field];
    }
  });
  
  await session.save();
  await session.populate('createdBy', 'name email');
  
  res.status(200).json({
    success: true,
    message: 'Session updated successfully',
    data: session
  });
});

/**
 * @desc    Delete session
 * @route   DELETE /api/v1/sessions/:id
 * @access  Private (Admin)
 */
const deleteSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  // Soft delete
  session.isActive = false;
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Session deleted successfully'
  });
});

/**
 * @desc    Register for session
 * @route   POST /api/v1/sessions/:id/register
 * @access  Private
 */
const registerForSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  if (!session.isActive) {
    throw new AppError('Session is not active', 400);
  }
  
  if (session.registeredUsers.includes(req.user._id)) {
    throw new AppError('Already registered for this session', 400);
  }
  
  if (session.registeredUsers.length >= session.maxCapacity) {
    throw new AppError('Session is full', 400);
  }
  
  session.registeredUsers.push(req.user._id);
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Registered for session successfully'
  });
});

/**
 * @desc    Unregister from session
 * @route   DELETE /api/v1/sessions/:id/register
 * @access  Private
 */
const unregisterFromSession = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  
  if (!session) {
    throw new AppError('Session not found', 404);
  }
  
  session.registeredUsers = session.registeredUsers.filter(
    userId => userId.toString() !== req.user._id.toString()
  );
  await session.save();
  
  res.status(200).json({
    success: true,
    message: 'Unregistered from session successfully'
  });
});

module.exports = {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  registerForSession,
  unregisterFromSession
};
