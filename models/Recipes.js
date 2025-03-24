const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }  // e.g., "g", "ml", "pcs"
});

const nutritionalValuesSchema = new mongoose.Schema({
    calories: { type: Number, required: true },
    proteins: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    fiber: { type: Number }
});

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    ingredients: [ingredientSchema],
    instructions: [{
        type: String,
        required: true
    }],
    preparationTime: {
        type: Number,  // in minutes
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true
    },
    servings: {
        type: Number,
        required: true
    },
    nutritionalValues: nutritionalValuesSchema,
    category: {
        type: String,
        enum: ['Breakfast', 'Morning Snack', 'Lunch', 'Dinner', 'Evening Snack'],
        required: true
    },
    image: {
        type: String  // URL dell'immagine
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professionists',
        required: true
    }
}, {
    timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
