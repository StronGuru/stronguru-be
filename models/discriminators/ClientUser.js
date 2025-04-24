const { default: mongoose } = require("mongoose");
const { USER_ROLES } = require('../../constants/userRoles');
const User = require("../User");

const ClientUserSchema = new mongoose.Schema({
    healthData: {
        type: Object,
        required: false,
        height: {
            type: Number,
            required: false,
        },
        weight: {
            type: Number,
            required: false,
        }
    },
    fitnessLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: false,
    },
    goals: {
        type: [String],
        enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility'],
        required: false,
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
        required: false,
    },
    preferences: {
        type: [String],
        enum: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
        required: false,
    },
    currentSports: {
        type: [String],
        required: false,
    },
    competitiveLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: false,
    },
})

module.exports = User.discriminator(USER_ROLES.USER, ClientUserSchema);