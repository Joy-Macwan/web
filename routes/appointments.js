// routes/appointments.js
const express = require('express');
const appointmentRouter = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { requireAuth } = require('../middleware/auth');

appointmentRouter.use(requireAuth);

appointmentRouter.get('/', appointmentController.listAppointments);
appointmentRouter.get('/book', appointmentController.renderBookAppointment);
appointmentRouter.post('/book', appointmentController.bookAppointment);
appointmentRouter.get('/:id', appointmentController.getAppointment);
appointmentRouter.put('/:id', appointmentController.updateAppointment);
appointmentRouter.delete('/:id', appointmentController.cancelAppointment);

module.exports = appointmentRouter;
