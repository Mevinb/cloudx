/**
 * Assignment Routes
 * Assignment and submission management endpoints
 */

const express = require('express');
const router = express.Router();
const { assignmentController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, authorize, assignmentValidators, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get all assignments
router.get('/', assignmentController.getAssignments);

// Get assignment by ID
router.get('/:id', commonValidators.mongoId, assignmentController.getAssignment);

// Create assignment (teachers/admin)
router.post('/', isTeacherOrAdmin, assignmentValidators.create, assignmentController.createAssignment);

// Update assignment (teachers/admin)
router.put('/:id', isTeacherOrAdmin, commonValidators.mongoId, assignmentController.updateAssignment);

// Delete assignment (admin only)
router.delete('/:id', isAdmin, commonValidators.mongoId, assignmentController.deleteAssignment);

// Submit assignment (students only)
router.post('/:id/submit', authorize('student'), commonValidators.mongoId, assignmentController.submitAssignment);

// Get my submission (students)
router.get('/:id/my-submission', authorize('student'), commonValidators.mongoId, assignmentController.getMySubmission);

// Get all submissions for an assignment (teachers/admin)
router.get('/:id/submissions', isTeacherOrAdmin, commonValidators.mongoId, assignmentController.getSubmissions);

// Grade submission (teachers/admin)
router.put('/submissions/:id/grade', isTeacherOrAdmin, assignmentValidators.grade, assignmentController.gradeSubmission);

module.exports = router;
