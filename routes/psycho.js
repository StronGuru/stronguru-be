const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Importa il modello

router.get('/', (req, res) => {
    res.send('Psycho route is working!');
});

// Rotta: Attiva il piano psicologico
router.put('/:id/psychoPlan', async (req, res) => {
    const { psychoPlan } = req.body;
    await User.findByIdAndUpdate(req.params.id, { psychoPlan }, { new: true });
    res.json({ message: 'Stato del piano psicologico cambiato' });
});

module.exports = router;
