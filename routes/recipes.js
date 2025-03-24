const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipes');

// Get all recipes
router.get('/', async (req, res) => {
    try {
        const recipes = await Recipe.find()
            .populate('createdBy', 'firstName lastName')
            .lean();

        if (!recipes || recipes.length === 0) {
            return res.status(404).json({ message: 'Nessuna ricetta trovata' });
        }

        res.json(recipes);
    } catch (err) {
        console.error('Error fetching recipes:', err);
        res.status(500).json({
            message: 'Errore nel recupero delle ricette',
            error: err.message
        });
    }
});

// Get recipe by ID
router.get('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id)
            .populate('createdBy', 'firstName lastName')
            .lean();

        if (!recipe) {
            return res.status(404).json({ message: 'Ricetta non trovata' });
        }

        res.json(recipe);
    } catch (err) {
        console.error('Error fetching recipe:', err);
        res.status(500).json({
            message: 'Errore nel recupero della ricetta',
            error: err.message
        });
    }
});

// Update recipe (PATCH)
router.patch('/:id', async (req, res) => {
    try {
        const allowedUpdates = [
            'title', 'description', 'ingredients', 'instructions',
            'preparationTime', 'difficulty', 'servings',
            'nutritionalValues', 'category', 'image'
        ];

        // Filter out any fields that aren't in allowedUpdates
        const updates = Object.keys(req.body)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = req.body[key];
                return obj;
            }, {});

        const recipe = await Recipe.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        ).populate('createdBy', 'firstName lastName');

        if (!recipe) {
            return res.status(404).json({ message: 'Ricetta non trovata' });
        }

        res.json({
            message: 'Ricetta aggiornata con successo',
            recipe
        });
    } catch (err) {
        console.error('Error updating recipe:', err);
        res.status(400).json({
            message: 'Errore nell\'aggiornamento della ricetta',
            error: err.message
        });
    }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Ricetta non trovata' });
        }

        res.json({
            message: 'Ricetta eliminata con successo',
            deletedRecipe: recipe
        });
    } catch (err) {
        console.error('Error deleting recipe:', err);
        res.status(500).json({
            message: 'Errore nella cancellazione della ricetta',
            error: err.message
        });
    }
});

// Add new recipe
router.post('/professionist/:professionistId', async (req, res) => {
    try {
        const {
            title,
            description,
            ingredients,
            instructions,
            preparationTime,
            difficulty,
            servings,
            nutritionalValues,
            category,
            image
        } = req.body;

        // Validate required fields
        if (!title || !ingredients || !instructions || !preparationTime || 
            !difficulty || !servings || !nutritionalValues || !category) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti'
            });
        }

        // Create new recipe
        const recipe = new Recipe({
            title,
            description,
            ingredients,
            instructions,
            preparationTime,
            difficulty,
            servings,
            nutritionalValues,
            category,
            image,
            createdBy: req.params.professionistId  // Use ID from URL parameters
        });

        await recipe.save();

        // Populate creator info before sending response
        const populatedRecipe = await Recipe.findById(recipe._id)
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            message: 'Ricetta creata con successo',
            recipe: populatedRecipe
        });
    } catch (err) {
        console.error('Error creating recipe:', err);
        res.status(400).json({
            message: 'Errore nella creazione della ricetta',
            error: err.message
        });
    }
});

// Get all recipes by professional ID
router.get('/professionist/:professionistId', async (req, res) => {
    try {
        const recipes = await Recipe.find({ createdBy: req.params.professionistId })
            .populate('createdBy', 'firstName lastName')
            .lean();

        if (!recipes || recipes.length === 0) {
            return res.status(404).json({ 
                message: 'Nessuna ricetta trovata per questo professionista' 
            });
        }

        res.json(recipes);
    } catch (err) {
        console.error('Error fetching professional\'s recipes:', err);
        res.status(500).json({
            message: 'Errore nel recupero delle ricette del professionista',
            error: err.message
        });
    }
});

module.exports = router;