/**
 * Dashboard Routes
 * Dashboard data endpoints
 */

const express = require('express');
const router = express.Router();
const { dashboardController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, authorize } = require('../middleware');

// All routes require authentication
router.use(protect);

// Student dashboard
router.get('/student', authorize('student'), dashboardController.getStudentDashboard);

// Teacher/Admin dashboard
router.get('/teacher', isTeacherOrAdmin, dashboardController.getTeacherDashboard);

// Admin analytics
router.get('/analytics', isAdmin, dashboardController.getAnalytics);

module.exports = router;
