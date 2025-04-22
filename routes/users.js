const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // Per leggere le variabili d'ambiente
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const { USER_ROLES } = require('../constants/userRoles');
const authorizeRoles = require('../middleware/authorizedRoles');


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         gender:
 *           type: string
 *         phone:
 *           type: string
 */


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Ottieni la lista completa di tutti gli utenti
 *     tags: [User]
 *     description: Restituisce tutti gli utenti del sistema. Accesso riservato agli admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista utenti restituita con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Utente non autenticato
 *       403:
 *         description: Accesso negato - permessi insufficienti
 */

//GET all users
router.get('/', authorizeRoles(USER_ROLES.ADMIN), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error('Errore nel recupero utenti:', err);
        res.status(500).json({ message: 'Errore del server' });
    }
});

module.exports = router;
