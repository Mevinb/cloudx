/**
 * Middleware Index
 * Central export for all middleware
 */

const { protect, authorize, optionalAuth, isAdmin, isTeacherOrAdmin, isOwnerOrAdmin } = require('./auth');
const { AppError, notFound, errorHandler, asyncHandler } = require('./errorHandler');
const validation = require('./validation');

module.exports = {
  // Auth
  protect,
  authorize,
  optionalAuth,
  isAdmin,
  isTeacherOrAdmin,
  isOwnerOrAdmin,
  
  // Error handling
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  
  // Validation
  ...validation
};
