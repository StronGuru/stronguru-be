const AppointmentService = require('./service');

exports.createAppointmentSlot = async (req, res, next) => {
  try {
    const slot = await AppointmentService.createAppointmentSlot(req.body, req.user._id);
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { professionalId, startDate, endDate } = req.query;
    const slots = await AppointmentService.getAvailableSlots(professionalId, startDate, endDate);
    res.status(200).json(slots);
  } catch (error) {
    next(error);
  }
};

exports.bookAppointment = async (req, res, next) => {
  try {
    const appointment = await AppointmentService.bookAppointment(req.params.id, req.user._id);
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

exports.getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await AppointmentService.getUserAppointments(req.user._id, req.user.role);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const appointment = await AppointmentService.updateAppointmentStatus(
      req.params.id,
      req.user._id,
      req.body.status
    );
    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};