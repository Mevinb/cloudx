/**
 * Session Routes
 * Session/Meeting management endpoints
 */

const express = require('express');
const router = express.Router();
const { sessionController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, sessionValidators, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get all sessions
router.get('/', sessionController.getSessions);

// Get session by ID
router.get('/:id', commonValidators.mongoId, sessionController.getSession);

// Create session (teachers/admin)
router.post('/', isTeacherOrAdmin, sessionValidators.create, sessionController.createSession);

// Update session (teachers/admin)
router.put('/:id', isTeacherOrAdmin, sessionValidators.update, sessionController.updateSession);

// Delete session (admin only)
router.delete('/:id', isAdmin, commonValidators.mongoId, sessionController.deleteSession);

// Register for session
router.post('/:id/register', commonValidators.mongoId, sessionController.registerForSession);

// Unregister from session
router.delete('/:id/register', commonValidators.mongoId, sessionController.unregisterFromSession);

module.exports = router;
