const express = require('express');
const router = express.Router();
const { upload, uploadImage, uploadVideo, deleteMedia } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// All upload routes require authentication
router.use(protect);

// Upload image
router.post('/image', upload.single('file'), uploadImage);

// Upload video
router.post('/video', upload.single('file'), uploadVideo);

// Delete media
router.delete('/', deleteMedia);

module.exports = router;
