const express = require('express');
const router = express.Router();
const Professionists = require('../models/Professionists'); // Importa il modello

router.get('/', async (req, res) => {
    res.json({ message: 'Settings route' });
});

router.get('/professionist/:id', async (req, res) => {
    const professionist = await Professionists.findById(req.params.id);
    res.json(professionist.settings);
});

// Rotta: Aggiorna la lingua nelle impostazioni del professionista
router.patch('/professionist/:id/language', async (req, res) => {
    try {
        const { language } = req.body;

        // Validate language input
        if (!language) {
            return res.status(400).json({
                message: 'La lingua è richiesta'
            });
        }

        // Find and update the professionist's language setting
        const professionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            { 
                'settings.language': language 
            },
            { new: true }
        );

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        res.json({
            message: 'Lingua aggiornata con successo',
            language: professionist.settings.language
        });

    } catch (err) {
        console.error('Error updating language setting:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiornamento della lingua',
            error: err.message
        });
    }
});

// Rotta: Aggiorna allowEmail nelle impostazioni del professionista
router.patch('/professionist/:id/allowEmail', async (req, res) => {
    try {
        const { allowEmail } = req.body;

        // Validate allowEmail input
        if (typeof allowEmail !== 'boolean') {
            return res.status(400).json({
                message: 'allowEmail deve essere un valore booleano'
            });
        }

        // Find and update the professionist's allowEmail setting
        const professionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            { 
                'settings.allowEmail': allowEmail 
            },
            { new: true }
        );

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        res.json({
            message: 'Impostazione allowEmail aggiornata con successo',
            allowEmail: professionist.settings.allowEmail
        });

    } catch (err) {
        console.error('Error updating allowEmail setting:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiornamento dell\'impostazione allowEmail',
            error: err.message
        });
    }
});

// Rotta: Aggiorna allowNewPatients nelle impostazioni del professionista
router.patch('/professionist/:id/allowNewPatients', async (req, res) => {
    try {
        const { allowNewPatients } = req.body;

        // Validate allowNewPatients input
        if (typeof allowNewPatients !== 'boolean') {
            return res.status(400).json({
                message: 'allowNewPatients deve essere un valore booleano'
            });
        }

        // Find and update the professionist's allowNewPatients setting
        const professionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            { 
                'settings.allowNewPatients': allowNewPatients 
            },
            { new: true }
        );

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        res.json({
            message: 'Impostazione allowNewPatients aggiornata con successo',
            allowNewPatients: professionist.settings.allowNewPatients
        });

    } catch (err) {
        console.error('Error updating allowNewPatients setting:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiornamento dell\'impostazione allowNewPatients',
            error: err.message
        });
    }
});

// Rotta: Aggiorna showNumber nelle impostazioni del professionista
router.patch('/professionist/:id/showNumber', async (req, res) => {
    try {
        const { showNumber } = req.body;

        // Validate showNumber input
        if (typeof showNumber !== 'boolean') {
            return res.status(400).json({
                message: 'showNumber deve essere un valore booleano'
            });
        }

        // Find and update the professionist's showNumber setting
        const professionist = await Professionists.findByIdAndUpdate(
            req.params.id,
            { 
                'settings.showNumber': showNumber 
            },
            { new: true }
        );

        if (!professionist) {
            return res.status(404).json({
                message: 'Professionista non trovato'
            });
        }

        res.json({
            message: 'Impostazione showNumber aggiornata con successo',
            showNumber: professionist.settings.showNumber
        });

    } catch (err) {
        console.error('Error updating showNumber setting:', err);
        res.status(500).json({
            message: 'Errore nell\'aggiornamento dell\'impostazione showNumber',
            error: err.message
        });
    }
});


module.exports = router;