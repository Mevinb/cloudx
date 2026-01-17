/**
 * Services Index
 * Central export for all services
 */

const storageService = require('./storageService');
const emailService = require('./emailService');

module.exports = {
  storageService,
  emailService
};
