/**
 * Agenda Controller
 * Handles agenda/event management
 */

const { Agenda, Session } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all agendas
 * @route   GET /api/v1/agendas
 * @access  Private
 */
const getAgendas = asyncHandler(async (req, res) => {
  const { upcoming, search, page = 1, limit = 20 } = req.query;
  
  const query = { isPublished: true };
  
  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  } else if (upcoming === 'false') {
    query.date = { $lt: new Date() };
  }
  
  if (search) {
    query.$or = [
      { topic: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { speaker: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [agendas, total] = await Promise.all([
    Agenda.find(query)
      .populate('createdBy', 'name email')
      .populate('speakerUser', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Agenda.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    data: agendas,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get upcoming agendas
 * @route   GET /api/v1/agendas/upcoming
 * @access  Private
 */
const getUpcomingAgendas = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const agendas = await Agenda.find({
    isPublished: true,
    date: { $gte: new Date() }
  })
    .populate('createdBy', 'name')
    .populate('speakerUser', 'name')
    .sort({ date: 1 })
    .limit(parseInt(limit));
  
  res.status(200).json({
    success: true,
    data: agendas
  });
});

/**
 * @desc    Get agenda by ID
 * @route   GET /api/v1/agendas/:id
 * @access  Private
 */
const getAgenda = asyncHandler(async (req, res) => {
  const agenda = await Agenda.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('speakerUser', 'name email')
    .populate('registeredAttendees', 'name email batch');
  
  if (!agenda) {
    throw new AppError('Agenda not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: agenda
  });
});

/**
 * @desc    Create agenda
 * @route   POST /api/v1/agendas
 * @access  Private (Teacher/Admin)
 */
const createAgenda = asyncHandler(async (req, res) => {
  const {
    date,
    topic,
    description,
    speaker,
    speakerUser,
    location,
    startTime,
    endTime,
    resources,
    tags,
    sessionId
  } = req.body;
  
  const agenda = await Agenda.create({
    date,
    topic,
    description,
    speaker,
    speakerUser,
    location,
    startTime,
    endTime,
    resources,
    tags,
    session: sessionId,
    createdBy: req.user._id
  });
  
  // Link to session if provided
  if (sessionId) {
    await Session.findByIdAndUpdate(sessionId, { agenda: agenda._id });
  }
  
  await agenda.populate('createdBy', 'name email');
  
  res.status(201).json({
    success: true,
    message: 'Agenda created successfully',
    data: agenda
  });
});

/**
 * @desc    Update agenda
 * @route   PUT /api/v1/agendas/:id
 * @access  Private (Teacher/Admin)
 */
const updateAgenda = asyncHandler(async (req, res) => {
  const agenda = await Agenda.findById(req.params.id);
  
  if (!agenda) {
    throw new AppError('Agenda not found', 404);
  }
  
  const allowedUpdates = [
    'date',
    'topic',
    'description',
    'speaker',
    'speakerUser',
    'location',
    'startTime',
    'endTime',
    'resources',
    'tags',
    'isPublished'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      agenda[field] = req.body[field];
    }
  });
  
  await agenda.save();
  await agenda.populate('createdBy', 'name email');
  
  res.status(200).json({
    success: true,
    message: 'Agenda updated successfully',
    data: agenda
  });
});

/**
 * @desc    Delete agenda
 * @route   DELETE /api/v1/agendas/:id
 * @access  Private (Admin)
 */
const deleteAgenda = asyncHandler(async (req, res) => {
  const agenda = await Agenda.findById(req.params.id);
  
  if (!agenda) {
    throw new AppError('Agenda not found', 404);
  }
  
  // Remove agenda reference from session
  if (agenda.session) {
    await Session.findByIdAndUpdate(agenda.session, { $unset: { agenda: 1 } });
  }
  
  await Agenda.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Agenda deleted successfully'
  });
});

/**
 * @desc    Register for agenda
 * @route   POST /api/v1/agendas/:id/register
 * @access  Private
 */
const registerForAgenda = asyncHandler(async (req, res) => {
  const agenda = await Agenda.findById(req.params.id);
  
  if (!agenda) {
    throw new AppError('Agenda not found', 404);
  }
  
  if (agenda.registeredAttendees.includes(req.user._id)) {
    throw new AppError('Already registered', 400);
  }
  
  agenda.registeredAttendees.push(req.user._id);
  await agenda.save();
  
  res.status(200).json({
    success: true,
    message: 'Registered successfully'
  });
});

/**
 * @desc    Unregister from agenda
 * @route   DELETE /api/v1/agendas/:id/register
 * @access  Private
 */
const unregisterFromAgenda = asyncHandler(async (req, res) => {
  const agenda = await Agenda.findById(req.params.id);
  
  if (!agenda) {
    throw new AppError('Agenda not found', 404);
  }
  
  agenda.registeredAttendees = agenda.registeredAttendees.filter(
    id => id.toString() !== req.user._id.toString()
  );
  await agenda.save();
  
  res.status(200).json({
    success: true,
    message: 'Unregistered successfully'
  });
});

module.exports = {
  getAgendas,
  getUpcomingAgendas,
  getAgenda,
  createAgenda,
  updateAgenda,
  deleteAgenda,
  registerForAgenda,
  unregisterFromAgenda
};
