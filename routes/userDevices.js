/**
 * @swagger
 * tags:
 *   name: UserDevices
 *   description: API per la gestione dei dispositivi dell'utente
 */
const express = require('express');
const router = express.Router();
const UserDevices = require('../models/UserDevices');

/**
 * @swagger
 * /devices/user/{userId}:
 *   get:
 *     summary: Ottiene tutti i dispositivi associati a un utente specifico
 *     tags: [UserDevices]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID dell'utente
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista dei dispositivi trovati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserDevice'
 *       500:
 *         description: Errore del server
 */
router.get('/user/:userId', async (req, res) => {
    try {
      const devices = await UserDevices.find({ user: req.params.userId });
      res.json(devices);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel recupero dei dispositivi' });
    }
  });

  /**
 * @swagger
 * /devices/{id}:
 *   get:
 *     summary: Ottiene un singolo dispositivo tramite il suo ID
 *     tags: [UserDevices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del dispositivo
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispositivo trovato
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDevice'
 *       404:
 *         description: Dispositivo non trovato
 *       500:
 *         description: Errore del server
 */
  router.get('/:id', async (req, res) => {
    try {
      const device = await UserDevices.findById(req.params.id);
      if (!device) return res.status(404).json({ message: 'Dispositivo non trovato' });
      res.json(device);
    } catch (err) {
      res.status(500).json({ message: 'Errore nel recupero del dispositivo' });
    }
  });

  /**
 * @swagger
 * /devices/{id}:
 *   delete:
 *     summary: Elimina un dispositivo per ID
 *     tags: [UserDevices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del dispositivo da eliminare
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dispositivo eliminato con successo
 *       404:
 *         description: Dispositivo non trovato
 *       500:
 *         description: Errore del server
 */
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
