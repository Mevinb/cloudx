/**
 * Attendance Routes
 * Attendance tracking endpoints
 */

const express = require('express');
const router = express.Router();
const { attendanceController } = require('../controllers');
const { protect, isTeacherOrAdmin, attendanceValidators, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get attendance analytics (teachers/admin)
router.get('/analytics', isTeacherOrAdmin, attendanceController.getAttendanceAnalytics);

// Get session attendance
router.get('/session/:sessionId', attendanceController.getSessionAttendance);

// Get user attendance
router.get('/user/:userId', attendanceController.getUserAttendance);

// Export attendance as CSV (teachers/admin)
router.get('/export/:sessionId', isTeacherOrAdmin, attendanceController.exportAttendance);

// Mark single attendance (teachers/admin)
router.post('/mark', isTeacherOrAdmin, attendanceValidators.mark, attendanceController.markAttendance);

// Bulk mark attendance (teachers/admin)
router.post('/bulk', isTeacherOrAdmin, attendanceValidators.bulkMark, attendanceController.bulkMarkAttendance);

// Self check-in
router.post('/checkin/:sessionId', attendanceController.selfCheckIn);

module.exports = router;
