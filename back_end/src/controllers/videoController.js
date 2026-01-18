/**
 * Video Controller
 * Handles YouTube video management for teachers and students
 */

const Video = require('../models/Video');
const { asyncHandler } = require('../middleware/errorHandler');
const { AppError } = require('../middleware/errorHandler');

/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&feature=share
 */
const extractYouTubeId = (url) => {
  if (!url) return null;

  // Clean the URL
  url = url.trim();

  // Pattern 1: youtu.be/VIDEO_ID
  const shortUrlMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortUrlMatch) return shortUrlMatch[1];

  // Pattern 2: youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // Pattern 4: youtube.com/v/VIDEO_ID
  const vMatch = url.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];

  // Pattern 5: Just the video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  return null;
};

/**
 * Extract Google Drive file ID from various URL formats
 * Supports:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
const extractGoogleDriveId = (url) => {
  if (!url) return null;

  // Clean the URL
  url = url.trim();

  // Pattern 1: drive.google.com/file/d/FILE_ID
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Pattern 2: drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];

  // Pattern 3: drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/drive\.google\.com\/uc\?id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];

  return null;
};

/**
 * @desc    Add a new video (YouTube or Google Drive)
 * @route   POST /api/v1/videos
 * @access  Private (Teacher/Admin)
 */
exports.addVideo = asyncHandler(async (req, res, next) => {
  const { title, youtubeUrl, description, videoSource = 'youtube' } = req.body;

  // Validate required fields
  if (!title || !youtubeUrl) {
    return next(new AppError('Title and URL are required', 400));
  }

  // Extract video ID based on source
  let videoId;
  if (videoSource === 'gdrive') {
    videoId = extractGoogleDriveId(youtubeUrl);
    if (!videoId) {
      return next(new AppError('Invalid Google Drive URL. Please use a shareable link.', 400));
    }
    // Prefix Google Drive IDs to distinguish them
    videoId = 'gdrive_' + videoId;
  } else {
    videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return next(new AppError('Invalid YouTube URL', 400));
    }
  }

  // Check if video already exists
  const existingVideo = await Video.findOne({ videoId, isActive: true });
  if (existingVideo) {
    return next(new AppError('This video has already been added', 400));
  }

  // Create video
  const video = await Video.create({
    title,
    youtubeUrl,
    videoId,
    description,
    addedBy: req.user._id,
  });

  // Populate the addedBy field
  await video.populate('addedBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Video added successfully',
    data: video,
  });
});

/**
 * @desc    Get all videos
 * @route   GET /api/v1/videos
 * @access  Private (All authenticated users)
 */
exports.getVideos = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, search } = req.query;

  // Build query
  const query = { isActive: true };

  // Search by title
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const videos = await Video.find(query)
    .populate('addedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Video.countDocuments(query);

  res.status(200).json({
    success: true,
    count: videos.length,
    total,
    totalPages: Math.ceil(total / parseInt(limit)),
    currentPage: parseInt(page),
    data: videos,
  });
});

/**
 * @desc    Get a single video
 * @route   GET /api/v1/videos/:id
 * @access  Private (All authenticated users)
 */
exports.getVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id).populate(
    'addedBy',
    'name email'
  );

  if (!video || !video.isActive) {
    return next(new AppError('Video not found', 404));
  }

  res.status(200).json({
    success: true,
    data: video,
  });
});

/**
 * @desc    Update a video
 * @route   PUT /api/v1/videos/:id
 * @access  Private (Teacher/Admin - owner or admin)
 */
exports.updateVideo = asyncHandler(async (req, res, next) => {
  const { title, youtubeUrl, description } = req.body;

  let video = await Video.findById(req.params.id);

  if (!video || !video.isActive) {
    return next(new AppError('Video not found', 404));
  }

  // Check ownership (unless admin)
  if (
    video.addedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to update this video', 403));
  }

  // Update fields
  if (title) video.title = title;
  if (description !== undefined) video.description = description;

  // If YouTube URL changed, extract new video ID
  if (youtubeUrl && youtubeUrl !== video.youtubeUrl) {
    const videoId = extractYouTubeId(youtubeUrl);
    if (!videoId) {
      return next(new AppError('Invalid YouTube URL', 400));
    }
    video.youtubeUrl = youtubeUrl;
    video.videoId = videoId;
  }

  await video.save();
  await video.populate('addedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Video updated successfully',
    data: video,
  });
});

/**
 * @desc    Delete a video
 * @route   DELETE /api/v1/videos/:id
 * @access  Private (Teacher/Admin - owner or admin)
 */
exports.deleteVideo = asyncHandler(async (req, res, next) => {
  const video = await Video.findById(req.params.id);

  if (!video || !video.isActive) {
    return next(new AppError('Video not found', 404));
  }

  // Check ownership (unless admin)
  if (
    video.addedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new AppError('Not authorized to delete this video', 403));
  }

  // Soft delete
  video.isActive = false;
  await video.save();

  res.status(200).json({
    success: true,
    message: 'Video deleted successfully',
    data: {},
  });
});

// Export the helper function for testing
exports.extractYouTubeId = extractYouTubeId;
