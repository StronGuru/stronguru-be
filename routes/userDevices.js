const express = require('express');
const router = express.Router();
const UserDevices = require('../models/UserDevices');

// GET /devices/users/:userId - Get all devices for a user
router.get('/user/:userId', async (req, res) => {
    try {
      const devices = await UserDevices.find({ user: req.params.userId });
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel recupero dei dispositivi' });
    }
  });

// GET /devices/:id - Get single device by ID
  router.get('/:id', async (req, res) => {
    try {
      const device = await UserDevices.findById(req.params.id);
      if (!device) return res.status(404).json({ message: 'Dispositivo non trovato' });
      res.json(device);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel recupero del dispositivo' });
    }
  });

// DELETE /devices/:id - Delete a devices by ID
  router.delete('/:id', async (req, res) => {
    try {
      const deleted = await UserDevices.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Dispositivo non trovato' });
      res.json({ message: 'Dispositivo eliminato con successo' });
    } catch (err) {
      res.status(500).json({ message: 'Errore durante l\'eliminazione' });
    }
  });

  module.exports = router;
