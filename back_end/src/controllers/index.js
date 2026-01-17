/**
 * Controllers Index
 * Central export for all controllers
 */

const authController = require('./authController');
const userController = require('./userController');
const sessionController = require('./sessionController');
const attendanceController = require('./attendanceController');
const agendaController = require('./agendaController');
const contentController = require('./contentController');
const assignmentController = require('./assignmentController');
const announcementController = require('./announcementController');
const dashboardController = require('./dashboardController');

module.exports = {
  authController,
  userController,
  sessionController,
  attendanceController,
  agendaController,
  contentController,
  assignmentController,
  announcementController,
  dashboardController
};
