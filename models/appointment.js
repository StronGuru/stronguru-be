const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  // Basic appointment information
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },

  // Timing details
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },

  // Participants
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Group event settings
  isGroupEvent: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 100,
    max: 100
  },

  // Appointment status
  status: {
    type: String,
    enum: ['available', 'booked', 'confirmed', 'completed', 'cancelled'],
    default: 'available'
  },

  // Meeting details
  meetingLink: String,
  
  // Payment information
  price: {
    type: Number,
    min: 0,
    default: 0
  },

  // Timestamps for tracking
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Recurring appointment settings
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  recurrenceInterval: {
    type: Number,
    default: 1,
    required: function() { return this.isRecurring; }
  },
  recurrenceEndDate: {
    type: Date,
    required: function() { return this.isRecurring; }
  },
  daysOfWeek: [{
    type: Number,
    min: 0,
    max: 6
  }],
});

// Index for common queries
appointmentSchema.index({ professional: 1, startTime: 1 });
appointmentSchema.index({ participants: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);