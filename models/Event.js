const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    patientId: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                // Validates time format HH:mm
                return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} non è un formato orario valido! Usa il formato HH:mm`
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

// Create index for efficient querying by date and user
eventSchema.index({ date: 1, user: 1 });

module.exports = mongoose.model('Event', eventSchema);
