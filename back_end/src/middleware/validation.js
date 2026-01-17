/**
 * Validation Middleware
 * Request validation using express-validator
 */

const { validationResult, body, param, query } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Auth Validators
 */
const authValidators = {
  register: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['student', 'teacher', 'admin']).withMessage('Invalid role'),
    body('batch')
      .optional()
      .trim(),
    handleValidation
  ],
  
  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please enter a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidation
  ],

  refreshToken: [
    body('refreshToken')
      .notEmpty().withMessage('Refresh token is required'),
    handleValidation
  ]
};

/**
 * Session Validators
 */
const sessionValidators = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('startTime')
      .notEmpty().withMessage('Start time is required'),
    body('endTime')
      .notEmpty().withMessage('End time is required'),
    body('type')
      .optional()
      .isIn(['workshop', 'lecture', 'lab', 'seminar', 'meeting', 'other']),
    handleValidation
  ],
  
  update: [
    param('id').isMongoId().withMessage('Invalid session ID'),
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('date')
      .optional()
      .isISO8601().withMessage('Invalid date format'),
    handleValidation
  ]
};

/**
 * Attendance Validators
 */
const attendanceValidators = {
  mark: [
    body('sessionId')
      .notEmpty().withMessage('Session ID is required')
      .isMongoId().withMessage('Invalid session ID'),
    body('userId')
      .notEmpty().withMessage('User ID is required')
      .isMongoId().withMessage('Invalid user ID'),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
    handleValidation
  ],
  
  bulkMark: [
    body('sessionId')
      .notEmpty().withMessage('Session ID is required')
      .isMongoId().withMessage('Invalid session ID'),
    body('attendance')
      .isArray({ min: 1 }).withMessage('Attendance array is required'),
    body('attendance.*.userId')
      .isMongoId().withMessage('Invalid user ID'),
    body('attendance.*.status')
      .isIn(['present', 'absent', 'late', 'excused']).withMessage('Invalid status'),
    handleValidation
  ]
};

/**
 * Assignment Validators
 */
const assignmentValidators = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required'),
    body('dueDate')
      .notEmpty().withMessage('Due date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('points')
      .optional()
      .isInt({ min: 0 }).withMessage('Points must be a positive number'),
    handleValidation
  ],
  
  grade: [
    param('id').isMongoId().withMessage('Invalid submission ID'),
    body('score')
      .notEmpty().withMessage('Score is required')
      .isFloat({ min: 0 }).withMessage('Score must be a positive number'),
    body('feedback')
      .optional()
      .trim(),
    handleValidation
  ]
};

/**
 * Content Validators
 */
const contentValidators = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('type')
      .notEmpty().withMessage('Content type is required')
      .isIn(['video', 'pdf', 'slides', 'document', 'link', 'other']),
    body('topic')
      .trim()
      .notEmpty().withMessage('Topic is required'),
    handleValidation
  ]
};

/**
 * Announcement Validators
 */
const announcementValidators = {
  create: [
    body('title')
      .trim()
      .notEmpty().withMessage('Title is required')
      .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
    body('content')
      .trim()
      .notEmpty().withMessage('Content is required'),
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'medium', 'high', 'urgent']),
    body('category')
      .optional()
      .isIn(['General', 'Event', 'Assignment', 'Resources', 'Urgent', 'Other']),
    handleValidation
  ]
};

/**
 * Agenda Validators
 */
const agendaValidators = {
  create: [
    body('date')
      .notEmpty().withMessage('Date is required')
      .isISO8601().withMessage('Invalid date format'),
    body('topic')
      .trim()
      .notEmpty().withMessage('Topic is required')
      .isLength({ max: 200 }).withMessage('Topic cannot exceed 200 characters'),
    body('speaker')
      .optional()
      .trim(),
    handleValidation
  ]
};

/**
 * Common Validators
 */
const commonValidators = {
  mongoId: [
    param('id').isMongoId().withMessage('Invalid ID'),
    handleValidation
  ],
  
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    handleValidation
  ]
};

module.exports = {
  handleValidation,
  authValidators,
  sessionValidators,
  attendanceValidators,
  assignmentValidators,
  contentValidators,
  announcementValidators,
  agendaValidators,
  commonValidators
};
