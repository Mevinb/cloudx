/**
 * Agenda Routes
 * Agenda/Event management endpoints
 */

const express = require('express');
const router = express.Router();
const { agendaController } = require('../controllers');
const { protect, isAdmin, isTeacherOrAdmin, agendaValidators, commonValidators } = require('../middleware');

// All routes require authentication
router.use(protect);

// Get upcoming agendas
router.get('/upcoming', agendaController.getUpcomingAgendas);

// Get all agendas
router.get('/', agendaController.getAgendas);

// Get agenda by ID
router.get('/:id', commonValidators.mongoId, agendaController.getAgenda);

// Create agenda (teachers/admin)
router.post('/', isTeacherOrAdmin, agendaValidators.create, agendaController.createAgenda);

// Update agenda (teachers/admin)
router.put('/:id', isTeacherOrAdmin, commonValidators.mongoId, agendaController.updateAgenda);

// Delete agenda (admin only)
router.delete('/:id', isAdmin, commonValidators.mongoId, agendaController.deleteAgenda);

// Register for agenda
router.post('/:id/register', commonValidators.mongoId, agendaController.registerForAgenda);

// Unregister from agenda
router.delete('/:id/register', commonValidators.mongoId, agendaController.unregisterFromAgenda);

module.exports = router;
