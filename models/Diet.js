const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
    food: String,
    quantity: Number,
    unit: String,
    calories: Number,
    proteins: Number,
    carbs: Number,
    fats: Number
});

const mealSchema = new mongoose.Schema({
    foods: [foodItemSchema]
});

const dailyDietSchema = new mongoose.Schema({
    title: String,
    index: Number,
    breakfast: mealSchema,
    morningSnack: mealSchema,
    lunch: mealSchema,
    afternoonSnack: mealSchema,
    dinner: mealSchema,
    eveningSnack: mealSchema
});

const dietSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ''
    },
    dailyDiet: [dailyDietSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

module.exports = mongoose.model('Diet', dietSchema);
