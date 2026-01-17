/**
 * Models Index
 * Central export for all database models
 */

const User = require('./User');
const Session = require('./Session');
const Attendance = require('./Attendance');
const Agenda = require('./Agenda');
const Content = require('./Content');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Announcement = require('./Announcement');

module.exports = {
  User,
  Session,
  Attendance,
  Agenda,
  Content,
  Assignment,
  Submission,
  Announcement
};
