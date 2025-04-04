/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API per la gestione dell'autenticazione e attivazione utenti
 */

const express = require('express');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const userActivationEmail = require("../config/emailService");
const UserToken = require("../models/UserToken");
require('dotenv').config();

const router = express.Router();


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Registrazione di un nuovo utente
 *     tags: [Auth]
 *     description: Crea un nuovo utente nel sistema, invia una email di attivazione all'indirizzo fornito e richiede la verifica dell'account.
 *     requestBody:
 *       description: I dati dell'utente per la registrazione
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registrazione riuscita. Un'email di attivazione è stata inviata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: Errore nella registrazione o l'utente esiste già con l'email fornita.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       500:
 *         description: Errore nel server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, password, dateOfBirth, gender, phone} = req.body;

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utente già registrato con questa email' });
        }

        // Crea un nuovo utente
        const user = new User({ firstName, lastName, email, password, dateOfBirth, gender, phone });

        const activationToken = crypto.randomBytes(32).toString("hex");

        //il token viene creato prima di aver salvato lo user, invertire l'ordine? - Ms
        await new UserToken({
            userId: user._id,
            token: activationToken,
            type: "activation",
        }).save();

        userActivationEmail(user.email, activationToken);

        // Before saving the user
        console.log('User before save:', user);

        // Save user
        await user.save();

        res.status(201).json({
            message: 'Registrazione riuscita. Per favore controlla la tua email per verificare l\'account',
            userId: user._id
        });
    } catch (err) {
        console.error('Error in signup:', err);
        res.status(400).json({
            message: 'Errore nella registrazione dell\'utente',
            error: err.message
        });
    }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login per un utente esistente
 *     tags: [Auth]
 *     description: Autentica un utente nel sistema, controllando la validità delle credenziali e generando un token JWT per l'accesso.
 *     requestBody:
 *       description: Le credenziali di login dell'utente
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login riuscito. Restituisce un token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Credenziali non valide o utente non trovato.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *       401:
 *         description: L'utente non ha verificato la sua email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Errore del server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Nessun account registrato con questa email' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenziali non valide' });

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(401).json({ 
            message: 'Per favore verifica la tua email prima di accedere' 
        });
    }

   

    const payload = { 
        id: user.id, 
        name: `${user.firstName} ${user.lastName}`, //user.name non veniva usato nel model
        role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ message: 'Login riuscito', 
                token,  });
  } catch (err) {
    res.status(500).json({ msg: 'Errore del server' });
  }
});

module.exports = router;