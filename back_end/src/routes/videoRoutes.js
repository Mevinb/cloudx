/**
 * Video Routes
 * Routes for YouTube video management
 */

const express = require('express');
const router = express.Router();
const {
  addVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
} = require('../controllers/videoController');
const { protect, isTeacherOrAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Debug middleware
router.use((req, res, next) => {
  console.log(`[Videos Route] ${req.method} ${req.originalUrl}`);
  console.log('[Videos Route] User:', req.user?.email || 'Not authenticated');
  next();
});

// GET /api/v1/videos - Get all videos (all authenticated users)
// POST /api/v1/videos - Add a video (teachers/admins only)
router
  .route('/')
  .get(getVideos)
  .post(isTeacherOrAdmin, addVideo);

// GET /api/v1/videos/:id - Get single video
// PUT /api/v1/videos/:id - Update video (owner/admin)
// DELETE /api/v1/videos/:id - Delete video (owner/admin)
router
  .route('/:id')
  .get(getVideo)
  .put(isTeacherOrAdmin, updateVideo)
  .delete(isTeacherOrAdmin, deleteVideo);

module.exports = router;
