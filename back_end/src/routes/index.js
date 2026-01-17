/**
 * Routes Index
 * Central export and mounting for all API routes
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const sessionRoutes = require('./sessions');
const attendanceRoutes = require('./attendance');
const agendaRoutes = require('./agendas');
const contentRoutes = require('./content');
const assignmentRoutes = require('./assignments');
const announcementRoutes = require('./announcements');
const dashboardRoutes = require('./dashboard');
const videoRoutes = require('./videoRoutes');

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CloudX API is running',
    timestamp: new Date().toISOString(),
    version: 'v1'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/agendas', agendaRoutes);
router.use('/content', contentRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/announcements', announcementRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/videos', videoRoutes);

module.exports = router;
