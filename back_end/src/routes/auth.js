/**
 * Auth Routes
 * Authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { protect, authValidators } = require('../middleware');

// Public routes
router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);
router.post('/refresh-token', authValidators.refreshToken, authController.refreshToken);

// Protected routes
router.use(protect);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.put('/me', authController.updateMe);
router.put('/password', authController.updatePassword);

module.exports = router;
