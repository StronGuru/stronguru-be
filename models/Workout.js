const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    repetitions: { type: String, required: true },
    sets: { type: Number, required: true },
    restTime: { type: Number },  // in seconds
    unit: { type: String },    // optional, for tracking weight used
    notes: { type: String }      // optional notes for the exercise
});

const daySchema = new mongoose.Schema({
    focus: { type: String },
    exercises: [exerciseSchema]
});

const weekSchema = new mongoose.Schema({
    days: [daySchema]
});

const workoutSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    note: {
        type: String
    },
    weeks: [weekSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Remove required: true
    },
    type: {
        type: String,
        enum: ['personal', 'group'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'],
        default: 'active'
    }
}, {
    timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;
