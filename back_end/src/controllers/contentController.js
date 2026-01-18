/**
 * Content Controller
 * Handles learning content management
 */

const { Content } = require('../models');
const { asyncHandler, AppError } = require('../middleware');

/**
 * @desc    Get all content
 * @route   GET /api/v1/content
 * @access  Private
 */
const getContent = asyncHandler(async (req, res) => {
  const { type, topic, search, page = 1, limit = 20 } = req.query;
  
  const query = { isPublished: true };
  
  // Filter by access level based on user role
  if (req.user.role === 'student') {
    query.accessLevel = { $in: ['all', 'members'] };
  } else if (req.user.role === 'teacher' || req.user.role === 'admin') {
    query.accessLevel = { $in: ['all', 'members', 'teachers'] };
  }
  
  if (type) {
    query.type = type;
  }
  
  if (topic) {
    query.topic = { $regex: topic, $options: 'i' };
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { topic: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [content, total] = await Promise.all([
    Content.find(query)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Content.countDocuments(query)
  ]);
  
  res.status(200).json({
    success: true,
    data: content,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

/**
 * @desc    Get content by ID
 * @route   GET /api/v1/content/:id
 * @access  Private
 */
const getContentById = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id)
    .populate('uploadedBy', 'name email');
  
  if (!content) {
    throw new AppError('Content not found', 404);
  }
  
  // Check access level
  if (content.accessLevel === 'admin' && req.user.role !== 'admin') {
    throw new AppError('Access denied', 403);
  }
  
  if (content.accessLevel === 'teachers' && !['teacher', 'admin'].includes(req.user.role)) {
    throw new AppError('Access denied', 403);
  }
  
  // Increment views
  content.views += 1;
  await content.save();
  
  res.status(200).json({
    success: true,
    data: content
  });
});

/**
 * @desc    Get content by topic
 * @route   GET /api/v1/content/topic/:topic
 * @access  Private
 */
const getContentByTopic = asyncHandler(async (req, res) => {
  const { topic } = req.params;
  
  const query = {
    isPublished: true,
    topic: { $regex: topic, $options: 'i' }
  };
  
  if (req.user.role === 'student') {
    query.accessLevel = { $in: ['all', 'members'] };
  }
  
  const content = await Content.find(query)
    .populate('uploadedBy', 'name')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    data: content
  });
});

/**
 * @desc    Create content
 * @route   POST /api/v1/content
 * @access  Private (Teacher/Admin)
 */
const createContent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    type,
    topic,
    url,
    embedUrl,
    duration,
    pageCount,
    slideCount,
    tags,
    accessLevel
  } = req.body;
  
  const content = await Content.create({
    title,
    description,
    type,
    topic,
    url,
    embedUrl,
    duration,
    pageCount,
    slideCount,
    tags,
    accessLevel,
    uploadedBy: req.user._id
  });
  
  await content.populate('uploadedBy', 'name');
  
  res.status(201).json({
    success: true,
    message: 'Content created successfully',
    data: content
  });
});

/**
 * @desc    Upload content file
 * @route   POST /api/v1/content/upload
 * @access  Private (Teacher/Admin)
 */
const uploadContent = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Please upload a file', 400);
  }
  
  const {
    title,
    description,
    topic,
    tags,
    accessLevel
  } = req.body;
  
  // Determine type from mimetype
  let type = 'other';
  const mimeType = req.file.mimetype;
  
  if (mimeType.startsWith('video/')) {
    type = 'video';
  } else if (mimeType === 'application/pdf') {
    type = 'pdf';
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    type = 'slides';
  } else if (mimeType.includes('document') || mimeType.includes('word')) {
    type = 'document';
  }
  
  const content = await Content.create({
    title: title || req.file.originalname,
    description,
    type,
    topic: topic || 'General',
    fileName: req.file.originalname,
    fileKey: req.file.filename,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    tags: tags ? JSON.parse(tags) : [],
    accessLevel: accessLevel || 'members',
    uploadedBy: req.user._id
  });
  
  await content.populate('uploadedBy', 'name');
  
  res.status(201).json({
    success: true,
    message: 'Content uploaded successfully',
    data: content
  });
});

/**
 * @desc    Update content
 * @route   PUT /api/v1/content/:id
 * @access  Private (Teacher/Admin)
 */
const updateContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  
  if (!content) {
    throw new AppError('Content not found', 404);
  }
  
  const allowedUpdates = [
    'title',
    'description',
    'topic',
    'url',
    'embedUrl',
    'duration',
    'pageCount',
    'slideCount',
    'tags',
    'accessLevel',
    'isPublished',
    'thumbnail'
  ];
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      content[field] = req.body[field];
    }
  });
  
  await content.save();
  await content.populate('uploadedBy', 'name');
  
  res.status(200).json({
    success: true,
    message: 'Content updated successfully',
    data: content
  });
});

/**
 * @desc    Delete content
 * @route   DELETE /api/v1/content/:id
 * @access  Private (Admin)
 */
const deleteContent = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  
  if (!content) {
    throw new AppError('Content not found', 404);
  }
  
  // TODO: Delete file from storage if exists
  
  await Content.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Content deleted successfully'
  });
});

/**
 * @desc    Track content download
 * @route   POST /api/v1/content/:id/download
 * @access  Private
 */
const trackDownload = asyncHandler(async (req, res) => {
  const content = await Content.findById(req.params.id);
  
  if (!content) {
    throw new AppError('Content not found', 404);
  }
  
  content.downloads += 1;
  await content.save();
  
  res.status(200).json({
    success: true,
    data: {
      url: content.url,
      fileName: content.fileName
    }
  });
});

/**
 * @desc    Get all topics
 * @route   GET /api/v1/content/topics
 * @access  Private
 */
const getTopics = asyncHandler(async (req, res) => {
  const topics = await Content.distinct('topic', { isPublished: true });
  
  res.status(200).json({
    success: true,
    data: topics
  });
});

module.exports = {
  getContent,
  getContentById,
  getContentByTopic,
  createContent,
  uploadContent,
  updateContent,
  deleteContent,
  trackDownload,
  getTopics
};
