/**
 * Content Routes
 * Learning content management endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { contentController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, contentValidators, commonValidators } = require('../middleware');
const config = require('../config');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Allow specific file types
  const allowedTypes = [
    'application/pdf',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

// All routes require authentication
router.use(protect);

// Get all topics
router.get('/topics', contentController.getTopics);

// Get all content
router.get('/', contentController.getContent);

// Get content by topic
router.get('/topic/:topic', contentController.getContentByTopic);

// Get content by ID
router.get('/:id', commonValidators.mongoId, contentController.getContentById);

// Create content (teachers/admin)
router.post('/', isTeacherOrAdmin, contentValidators.create, contentController.createContent);

// Upload content file (teachers/admin)
router.post('/upload', isTeacherOrAdmin, upload.single('file'), contentController.uploadContent);

// Update content (teachers/admin)
router.put('/:id', isTeacherOrAdmin, commonValidators.mongoId, contentController.updateContent);

// Delete content (admin only)
router.delete('/:id', isAdmin, commonValidators.mongoId, contentController.deleteContent);

// Track download
router.post('/:id/download', commonValidators.mongoId, contentController.trackDownload);

module.exports = router;
