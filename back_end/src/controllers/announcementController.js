/**
 * Announcement Controller
 * Handles announcement management
 */

const { Announcement } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all announcements
 * @route   GET /api/v1/announcements
 * @access  Private
 */
const getAnnouncements = asyncHandler(async (req, res) => {
  const { category, priority, page = 1, limit = 20 } = req.query;
  
  // Build base query
  const query = {
    isPublished: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  // Filter by audience based on user role
  const audienceFilter = [{ targetAudience: 'all' }];
  
  if (req.user.role === 'student') {
    audienceFilter.push({ targetAudience: 'students' });
    if (req.user.batch) {
      audienceFilter.push({ targetAudience: 'batch', targetBatch: req.user.batch });
    }
  } else if (req.user.role === 'teacher') {
    audienceFilter.push({ targetAudience: 'teachers' });
    audienceFilter.push({ targetAudience: 'students' });
  } else if (req.user.role === 'admin') {
    // Admin sees everything
    audienceFilter.push({ targetAudience: 'teachers' });
    audienceFilter.push({ targetAudience: 'students' });
    audienceFilter.push({ targetAudience: 'batch' });
  }
  
  query.$and = [{ $or: audienceFilter }];
  
  if (category) {
    query.category = category;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('author', 'name role avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Announcement.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    data: announcements,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get recent announcements
 * @route   GET /api/v1/announcements/recent
 * @access  Private
 */
const getRecentAnnouncements = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const announcements = await Announcement.getForUser(req.user, {
    limit: parseInt(limit)
  });
  
  res.status(200).json({
    success: true,
    data: announcements
  });
});

/**
 * @desc    Get announcement by ID
 * @route   GET /api/v1/announcements/:id
 * @access  Private
 */
const getAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate('author', 'name role avatar');
  
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }
  
  // Mark as read
  const alreadyRead = announcement.readBy.some(
    r => r.user.toString() === req.user._id.toString()
  );
  
  if (!alreadyRead) {
    announcement.readBy.push({
      user: req.user._id,
      readAt: new Date()
    });
    await announcement.save();
  }
  
  res.status(200).json({
    success: true,
    data: announcement
  });
});

/**
 * @desc    Create announcement
 * @route   POST /api/v1/announcements
 * @access  Private (Teacher/Admin)
 */
const createAnnouncement = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    priority,
    category,
    isPinned,
    targetAudience,
    targetBatch,
    expiresAt
  } = req.body;
  
  const announcement = await Announcement.create({
    title,
    content,
    priority,
    category,
    isPinned,
    targetAudience,
    targetBatch,
    expiresAt,
    author: req.user._id
  });
  
  await announcement.populate('author', 'name role avatar');
  
  res.status(201).json({
    success: true,
    message: 'Announcement created successfully',
    data: announcement
  });
});

/**
 * @desc    Update announcement
 * @route   PUT /api/v1/announcements/:id
 * @access  Private (Teacher/Admin)
 */
const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }
  
  // Only author or admin can update
  if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this announcement', 403);
  }
  
  const allowedUpdates = [
    'title',
    'content',
    'priority',
    'category',
    'isPinned',
    'isPublished',
    'targetAudience',
    'targetBatch',
    'expiresAt'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      announcement[field] = req.body[field];
    }
  });
  
  await announcement.save();
  await announcement.populate('author', 'name role avatar');
  
  res.status(200).json({
    success: true,
    message: 'Announcement updated successfully',
    data: announcement
  });
});

/**
 * @desc    Delete announcement
 * @route   DELETE /api/v1/announcements/:id
 * @access  Private (Teacher/Admin - own announcements or admin)
 */
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }
  
  // Only author or admin can delete
  if (announcement.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this announcement', 403);
  }
  
  await Announcement.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Announcement deleted successfully'
  });
});

/**
 * @desc    Pin/Unpin announcement
 * @route   PUT /api/v1/announcements/:id/pin
 * @access  Private (Admin)
 */
const togglePin = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  
  if (!announcement) {
    throw new AppError('Announcement not found', 404);
  }
  
  announcement.isPinned = !announcement.isPinned;
  await announcement.save();
  
  res.status(200).json({
    success: true,
    message: announcement.isPinned ? 'Announcement pinned' : 'Announcement unpinned',
    data: announcement
  });
});

module.exports = {
  getAnnouncements,
  getRecentAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  togglePin
};
