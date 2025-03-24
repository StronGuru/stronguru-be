const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Workout = require('../models/Workout');
const mongoose = require('mongoose');

// Base route (most specific, no parameters)
router.get('/', (req, res) => {
    res.send('Gym route is working!');
});

// Specific workout routes (no user ID)
router.get('/workout/:workoutId', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.workoutId)) {
            return res.status(400).json({ 
                message: 'ID piano non valido' 
            });
        }

        const workout = await Workout.findById(req.params.workoutId)
            .populate('user', 'firstName lastName');

        if (!workout) {
            return res.status(404).json({ 
                message: 'Piano di allenamento non trovato' 
            });
        }

        res.json(workout);
    } catch (err) {
        console.error('Error fetching workout plan:', err);
        res.status(500).json({
            message: 'Errore nel recupero del piano di allenamento',
            error: err.message
        });
    }
});

router.delete('/workout/:workoutId', async (req, res) => {
    await Workout.findByIdAndDelete(req.params.workoutId);
    res.json({ message: 'Piano di allenamento eliminato con successo' });
});

// MaxLifts routes (with user ID)
router.post('/:id/maxLifts', async (req, res) => {
    try {
        const { name, weight } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                message: 'ID utente non valido' 
            });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        if (!user.maxLifts) {
            user.maxLifts = [];
        }

        user.maxLifts.push({ name, weight });
        await user.save();
        
        res.status(201).json({ 
            message: 'MaxLift aggiunto con successo',
            maxLift: user.maxLifts[user.maxLifts.length - 1]
        });
    } catch (err) {
        console.error('Full error:', err);
        res.status(400).json({ 
            message: 'Errore nell\'aggiunta del maxLift', 
            error: err.message 
        });
    }
});

router.delete('/:id/maxLifts/:maxLiftId', async (req, res) => {
    console.log('Delete route hit:', req.params);
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ 
                message: 'ID utente non valido' 
            });
        }

        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                message: 'Utente non trovato' 
            });
        }

        user.maxLifts.pull(req.params.maxLiftId);
        await user.save();
        
        res.status(200).json({ 
            message: 'MaxLift eliminato con successo' 
        });
    } catch (err) {
        console.error('Error deleting maxLift:', err);
        res.status(500).json({ 
            message: 'Errore nella cancellazione del maxLift',
            error: err.message 
        });
    }
});

// User workout routes (with user ID)
router.post('/:userId/workout', async (req, res) => {
    try {
        const { trainingPlan } = req.body;

        // Validate required fields
        if (!trainingPlan.title || !trainingPlan.label) {
            return res.status(400).json({
                message: 'Campi obbligatori mancanti. Necessari: title, label'
            });
        }

        // Validate user exists
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ 
                message: 'ID utente non valido' 
            });
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'Utente non trovato' 
            });
        }

        // Create new workout
        const workout = new Workout({
            title: trainingPlan.title,
            label: trainingPlan.label,
            note: trainingPlan.note || '',
            weeks: trainingPlan.weeks,
            user: req.params.userId,
            type: 'personal',
            status: 'active'
        });

        await workout.save();

        // Add workout reference to user's trainingPlans and update trainingPlan status
        if (!user.trainingPlans) {
            user.trainingPlans = [];
        }
        user.trainingPlans.push(workout._id);
        user.trainingPlan = true;  // Set training plan status to true
        await user.save();

        // Populate user info before sending response
        const populatedWorkout = await Workout.findById(workout._id)
            .populate('user', 'firstName lastName');

        res.status(201).json({
            message: 'Piano di allenamento creato con successo',
            workout: populatedWorkout
        });
    } catch (err) {
        console.error('Error creating workout plan:', err);
        res.status(400).json({
            message: 'Errore nella creazione del piano di allenamento',
            error: err.message
        });
    }
});

router.get('/:userId/workout', async (req, res) => {
    try {
        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
            return res.status(400).json({ 
                message: 'ID utente non valido' 
            });
        }

        // Find all workouts for this user
        const workouts = await Workout.find({ user: req.params.userId })
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 }); // Most recent first

        // Simply return the workouts array (empty if none found)
        res.json(workouts);
        
    } catch (err) {
        console.error('Error fetching workout plans:', err);
        res.status(500).json({
            message: 'Errore nel recupero dei piani di allenamento',
            error: err.message
        });
    }
});

// Rotta: Attiva il piano di allenamento
router.put('/:id/trainingPlan', async (req, res) => {
    const { trainingPlan } = req.body;
    await User.findByIdAndUpdate(req.params.id, { trainingPlan }, { new: true });
    res.json({ message: 'Stato del piano di allenamento cambiato' });
});

module.exports = router;
