const Appointment = require('../../models/appointment');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');
const sendTemplateEmail = require('../../config/emailService');

// Create new appointment slot
exports.createAppointmentSlot = async (appointmentData, professionalId) => {
  if (appointmentData.startTime >= appointmentData.endTime) {
    throwError(MESSAGES.APPOINTMENTS.INVALID_TIME_RANGE, 400);
  }

  if (appointmentData.isRecurring) {
    return createRecurringAppointments(appointmentData, professionalId);
  }

  const appointment = new Appointment({
    ...appointmentData,
    professional: professionalId,
    status: 'available'
  });

  return appointment.save();
};

const createRecurringAppointments = async (appointmentData, professionalId) => {
  const appointments = [];
  const startDate = new Date(appointmentData.startTime);
  const endDate = new Date(appointmentData.recurrenceEndDate);
  const duration = new Date(appointmentData.endTime) - new Date(appointmentData.startTime);
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // Check if this day should be included (for weekly pattern)
    if (appointmentData.recurrencePattern === 'weekly' && 
        appointmentData.daysOfWeek && 
        !appointmentData.daysOfWeek.includes(currentDate.getDay())) {
      currentDate = getNextDate(currentDate, appointmentData.recurrencePattern, appointmentData.recurrenceInterval);
      continue;
    }
    
    const appointmentStart = new Date(currentDate);
    const appointmentEnd = new Date(appointmentStart.getTime() + duration);
    
    const appointment = new Appointment({
      ...appointmentData,
      startTime: appointmentStart,
      endTime: appointmentEnd,
      professional: professionalId,
      status: 'available'
    });
    
    appointments.push(appointment);
    currentDate = getNextDate(currentDate, appointmentData.recurrencePattern, appointmentData.recurrenceInterval);
  }
  
  return Appointment.insertMany(appointments);
};

const getNextDate = (currentDate, pattern, interval) => {
  const nextDate = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
  }
  
  return nextDate;
};

// Get available slots for a professional
exports.getAvailableSlots = async (professionalId, startDate, endDate) => {
  return Appointment.find({
    professional: professionalId,
    status: 'available',
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).sort({ startTime: 1 });
};

// Book an appointment slot
exports.bookAppointment = async (appointmentId, clientId) => {
  const appointment = await Appointment.findById(appointmentId);
  
  if (!appointment) {
    throwError(MESSAGES.APPOINTMENTS.NOT_FOUND, 404);
  }

  if (appointment.status !== 'available') {
    throwError(MESSAGES.APPOINTMENTS.NOT_AVAILABLE, 400);
  }

  if (appointment.isGroupEvent) {
    if (appointment.participants.length >= appointment.maxParticipants) {
      throwError(MESSAGES.APPOINTMENTS.MAX_PARTICIPANTS_REACHED, 400);
    }
    appointment.participants.push(clientId);
  } else {
    appointment.participants = [clientId];
  }

  appointment.status = 'booked';
  return appointment.save();
};

// Get user appointments
exports.getUserAppointments = async (userId, userRole) => {
  const query = userRole === 'professional'
    ? { professional: userId }
    : { participants: userId };

  return Appointment.find(query)
    .sort({ startTime: 1 })
    .populate('professional', 'name email')
    .populate('participants', 'name email');
};

// Update appointment status
exports.updateAppointmentStatus = async (appointmentId, userId, newStatus) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('professional', 'name email')
    .populate('participants', 'name email');
  
  if (!appointment) {
    throwError(MESSAGES.APPOINTMENTS.NOT_FOUND, 404);
  }

  const validTransitions = {
    available: ['booked', 'cancelled'],
    booked: ['confirmed', 'cancelled'],
    confirmed: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[appointment.status].includes(newStatus)) {
    throwError(MESSAGES.APPOINTMENTS.INVALID_STATUS_TRANSITION, 400);
  }

  const oldStatus = appointment.status;
  appointment.status = newStatus;
  
  const savedAppointment = await appointment.save();
  
  // Send notifications on status change
  await sendStatusChangeNotification(savedAppointment, oldStatus, newStatus);
  
  return savedAppointment;
};

const sendStatusChangeNotification = async (appointment, oldStatus, newStatus) => {
  const recipients = [appointment.professional.email, ...appointment.participants.map(p => p.email)];
  
  for (const email of recipients) {
    await sendTemplateEmail({
      to: email,
      templateKey: 'APPOINTMENT_STATUS_CHANGED',
      dynamicData: {
        appointmentTitle: appointment.title,
        oldStatus,
        newStatus,
        startTime: appointment.startTime
      }
    });
  }
};
