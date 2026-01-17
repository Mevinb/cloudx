/**
 * User Routes
 * User management endpoints
 */

const express = require('express');
const router = express.Router();
const { userController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get member stats (teachers/admin)
router.get('/stats', isTeacherOrAdmin, userController.getMemberStats);

// Get all students (teachers/admin)
router.get('/students', isTeacherOrAdmin, userController.getStudents);

// Get all users (accessible to all authenticated users to see members list)
router.get('/', userController.getUsers);

// Get user by ID
router.get('/:id', commonValidators.mongoId, userController.getUser);

// Get user profile with stats
router.get('/:id/profile', commonValidators.mongoId, userController.getUserProfile);

// Update user (admin only)
router.put('/:id', isAdmin, commonValidators.mongoId, userController.updateUser);

// Delete user (admin only)
router.delete('/:id', isAdmin, commonValidators.mongoId, userController.deleteUser);

module.exports = router;
