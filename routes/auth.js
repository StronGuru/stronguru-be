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
const { USER_ROLES } = require('../constants/userRoles');
const Professional = require('../models/discriminators/Professional');
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const { default: mongoose } = require('mongoose');

const router = express.Router();


/**
 * @swagger
 * /auth/signup/professional:
 *   post:
 *     summary: Registrazione di un nuovo professionista
 *     tags: [Auth]
 *     description: Crea un nuovo utente con ruolo "professional", assegna le specializzazioni e invia un'email di attivazione.
 *     requestBody:
 *       description: I dati del professionista da registrare
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - dateOfBirth
 *               - gender
 *               - phone
 *               - role
 *               - specialization
 *               - acceptedTerms
 *               - acceptedPrivacy
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
 *               role:
 *                 type: string
 *                 enum: [professional]
 *               specialization:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [nutritionist, psychologist, trainer]
 *               pIva:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   cap:
 *                     type: string
 *                   province:
 *                     type: string
 *                   country:
 *                     type: string
 *               acceptedTerms:
 *                 type: boolean
 *               acceptedPrivacy:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Registrazione riuscita
 *       400:
 *         description: Dati mancanti o invalidi
 *       500:
 *         description: Errore del server
 */
router.post('/signup/professional', async (req, res) => {

    let professional = null;

    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            dateOfBirth, 
            gender, 
            phone, 
            role, 
            specializations,
            taxCode,
            pIva,
            contactEmail,
            contactPhone,
            address,
            acceptedTerms,
            acceptedPrivacy
        } = req.body;

        if(role != USER_ROLES.PROFESSIONAL) {
            return res.status(400).json({ message: 'Impossibile proseguire con la registrazione: RUOLO ERRATO PER LA SEGUENTE REGISTRAZIONE -> ' + role });
        }

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utente già registrato con questa email' });
        }

        const validSpecializations = filterValidSpecializations(specializations);
        console.log("specializzazioni valide: " + validSpecializations)

        if (validSpecializations.lenght === 0) {
            return res.status(400).json({ message: 'Nessuna specializzazione valida fornita' });
          }

        if (!acceptedTerms || !acceptedPrivacy) {
            return res.status(400).json({ message: 'È necessario accettare termini e privacy policy'});
        }

        professional = new Professional({
            firstName,
            lastName, 
            email, 
            password, 
            dateOfBirth, 
            gender, 
            phone, 
            role,
            specialization: validSpecializations,
            taxCode,
            pIva,
            contactEmail,
            contactPhone,
            address,
            acceptedTerms,
            acceptedPrivacy
        });

        await professional.save();

        assignSpecToProfessional(validSpecializations, professional._id);

        const activationToken = crypto.randomBytes(32).toString("hex");

        await new UserToken({
            userId: professional._id,
            token: activationToken,
            type: "activation",
        }).save();

        userActivationEmail(professional.email, activationToken);

        res.status(201).json({
            message: 'Registrazione professionista riuscita. Per favore controlla la tua email per verificare l\'account',
            userId: professional._id
        });
    } catch (err) {

        if (professional) {
            await Professional.deleteOne({ _id: professional._id }); // Rimuove il professional creato
        }

        console.error('Error durante la registrazione:', err);

        res.status(400).json({
            message: 'Errore nella registrazione del professionista',
            error: err.message
        });
    }
});


/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Effettua il login dell'utente
 *     description: |
 *       Effettua il login per un utente (atleta o professionista) e restituisce un token JWT.
 *       La richiesta richiede l'email, la password e il client da cui si sta accedendo (web o mobile).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - client
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               client:
 *                 type: string
 *                 enum: [web, mobile]
 *                 description: Tipo di client che effettua la richiesta
 *                 example: web
 *     responses:
 *       200:
 *         description: Login effettuato con successo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Il token JWT per l'autenticazione futura
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 64a1b7f54321cdef12345678
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     role:
 *                       type: string
 *                       enum: [athlete, professional]
 *                       example: professional
 *       400:
 *         description: Credenziali non valide o email non trovata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'Credenziali non valide'
 *       401:
 *         description: Email non verificata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Per favore verifica la tua email prima di accedere'
 *       403:
 *         description: Accesso non autorizzato in base al client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Solo i professionisti possono accedere da web.'
 *       500:
 *         description: Errore interno del server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: 'Errore del server'
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, client } = req.body;

    // Validazione di base
  if (!email || !password || !client) {
    return res.status(400).json({ message: 'Email, password e client sono richiesti.' });
  }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Nessun account registrato con questa email' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenziali non valide' });

     // Controllo client ↔ ruolo
  if (client === 'mobile' && user.role !== USER_ROLES.ATHLETE) {
    return res.status(403).json({ message: 'Solo gli atleti possono accedere da mobile.' });
  }

  if (client === 'web' && user.role !== USER_ROLES.PROFESSIONAL) {
    return res.status(403).json({ message: 'Solo i professionisti possono accedere da web: '  + user.role});
  }

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(401).json({ 
            message: 'Per favore verifica la tua email prima di accedere' 
        });
    }

   

    const payload = { 
        id: user.id,
        role: user.role,
        client: client };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        }
      });
  } catch (err) {
    res.status(500).json({ msg: 'Errore del server' });
  }
});

module.exports = router;