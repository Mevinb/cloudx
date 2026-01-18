/**
 * Announcement Routes
 * Announcement management endpoints
 */

const express = require('express');
const router = express.Router();
const { announcementController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, announcementValidators, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get recent announcements
router.get('/recent', announcementController.getRecentAnnouncements);

// Get all announcements
router.get('/', announcementController.getAnnouncements);

// Get announcement by ID
router.get('/:id', commonValidators.mongoId, announcementController.getAnnouncement);

// Create announcement (teachers/admin)
router.post('/', isTeacherOrAdmin, announcementValidators.create, announcementController.createAnnouncement);

// Update announcement (teachers/admin)
router.put('/:id', isTeacherOrAdmin, commonValidators.mongoId, announcementController.updateAnnouncement);

// Delete announcement (teachers/admin - own or admin all)
router.delete('/:id', isTeacherOrAdmin, commonValidators.mongoId, announcementController.deleteAnnouncement);

// Pin/Unpin announcement (admin only)
router.put('/:id/pin', isAdmin, commonValidators.mongoId, announcementController.togglePin);

module.exports = router;
