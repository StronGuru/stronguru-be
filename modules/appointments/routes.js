const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const AppointmentController = require('./controller');
const validate = require('../../middleware/validators/validationErrorHandler');
const { createSlotValidator, updateStatusValidator } = require('../../middleware/validators/appointmentValidator');

// Professional routes
router.post('/slots', authMiddleware(), createSlotValidator, validate, AppointmentController.createAppointmentSlot);

// Public routes
router.get('/slots', AppointmentController.getAvailableSlots);

// Authenticated user routes
router.post('/slots/:id/book', authMiddleware(), AppointmentController.bookAppointment);
router.get('/my-appointments', authMiddleware(), AppointmentController.getUserAppointments);
router.patch('/:id/status', authMiddleware(), updateStatusValidator, validate, AppointmentController.updateAppointmentStatus);

module.exports = router;