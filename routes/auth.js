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
const sendTemplateEmail = require("../config/emailService");
const UserToken = require("../models/UserToken");
require('dotenv').config();
const { USER_ROLES } = require('../constants/userRoles');
const Professional = require('../models/discriminators/Professional');
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const { default: mongoose } = require('mongoose');
const UserDevices = require('../models/UserDevices');
const { generateAccessToken, generateRefreshToken } = require('../helpers/tokenUtils');
const UserSettings = require('../models/UserSettings');

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
 *               - specializations
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
 *               specializations:
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

        if(role !== USER_ROLES.PROFESSIONAL) {
            return res.status(400).json({ message: 'Impossibile proseguire con la registrazione: RUOLO ERRATO PER LA SEGUENTE REGISTRAZIONE -> ' + role });
        }

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Utente già registrato con questa email' });
        }


        const validSpecializations = filterValidSpecializations(specializations);
        console.log("specializzazioni valide: " + validSpecializations)

        if (validSpecializations.length === 0) {
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
            specializations: validSpecializations,
            taxCode,
            pIva,
            contactEmail,
            contactPhone,
            address,
            acceptedTerms,
            acceptedPrivacy
        });

        await professional.save();

        await new UserSettings({
          user: professional._id
        }).save();


        assignSpecToProfessional(validSpecializations, professional._id);

        const activationToken = crypto.randomBytes(32).toString("hex");

        await new UserToken({
            userId: professional._id,
            token: activationToken,
            type: "activation",
        }).save();

        await sendTemplateEmail({
          to: professional.email,
          templateKey: 'REGISTRATION',
          dynamicData: {
            activationToken: activationToken
          }
        })

        console.log(`Email inviata a: ${professional.email}, con Token: ${activationToken.slice(0, 5)}...`);

        res.status(201).json({
            message: 'Registrazione professionista riuscita. Per favore controlla la tua email per verificare l\'account',
            userId: professional._id,
            activationKey: activationToken
        });
    } catch (err) {

        if (professional) {
            await Professional.deleteOne({ _id: professional._id }); // Rimuove il professional creato
            await UserToken.deleteOne({userId: professional._id});
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
 *     summary: Effettua il login per ottenere accesso al sistema
 *     tags: [Auth]
 *     description: |
 *       Questo endpoint consente agli utenti di effettuare il login fornendo l'email e la password.
 *       Se il login ha successo, viene restituito un nuovo access token e refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email dell'utente
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 description: La password dell'utente
 *                 example: "password123"
 *               client:
 *                 type: string
 *                 description: Il tipo di client che effettua la richiesta (mobile, web)
 *                 example: "mobile"
 *     responses:
 *       '200':
 *         description: Successo. Vengono restituiti i token di accesso e refresh.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Il nuovo access token generato.
 *                 refreshToken:
 *                   type: string
 *                   description: Il nuovo refresh token generato.
 *                 deviceId:
 *                   type: string
 *                   description: L'ID del dispositivo per cui è stato generato il token.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: L'ID dell'utente.
 *                     email:
 *                       type: string
 *                       description: L'email dell'utente.
 *                     role:
 *                       type: string
 *                       description: Il ruolo dell'utente.
 *       '400':
 *         description: Parametri mancanti o credenziali non valide.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 *       '403':
 *         description: Il ruolo dell'utente non consente l'accesso da questo client.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 *       '401':
 *         description: Email non verificata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 *       '500':
 *         description: Errore del server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
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

  if (client === 'web' && ![USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN].includes(user.role)) {
    return res.status(403).json({ message: 'Solo i professionisti o admin possono accedere da web: '  + user.role});
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
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const deviceType = req.useragent.isMobile
  ? 'mobile'
  : req.useragent.isTablet
  ? 'tablet'
  : 'desktop';

  let existingDevice;

  const deviceId = req.cookies.deviceId;
  if (deviceId) {
    existingDevice = await UserDevices.findOne({ _id: deviceId, user: user._id });
  }

    
    // se esiste, aggiorna il token e altri dati
    if (existingDevice) {
      existingDevice.refreshToken = refreshToken;
      existingDevice.ipAddress = req.ip;
      existingDevice.userAgent = req.useragent.source;
      existingDevice.deviceType = deviceType;
      existingDevice.lastAccessed = new Date();
      await existingDevice.save();
    } else {
      // se non esiste, crea un nuovo device
      const userDevice = new UserDevices({
        user: user._id,
        ipAddress: req.ip,
        userAgent: req.useragent.source,
        refreshToken: refreshToken,
        deviceType: deviceType,
      });
    
      await userDevice.save();
      existingDevice = userDevice;
    }
    
    res.cookie('refreshToken', refreshToken, { httpOnly: true,
      secure: true, // solo in HTTPS in prod
      secure: process.env.NODE_ENV === 'production', // true solo in prod (HTTPS)
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 giorni 
      });
    
      res.cookie('deviceId', existingDevice._id.toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });

    res.status(200).json({
        accessToken,
        deviceId: existingDevice._id,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        }
      });
  } catch (err) {
    res.status(500).json({ msg: 'Errore del server: ' + err });
  }
});

/**
 * @swagger
 * /auth/refresh-token:
  *   post:
 *     summary: Rinnova il token di accesso utilizzando il refresh token
 *     tags: [Auth]
 *     description: |
 *       Questo endpoint consente di ottenere un nuovo access token utilizzando un refresh token valido.
 *       Se il refresh token e il device ID sono corretti, viene restituito un nuovo access token. Entrambi vengono
 *       recuperati attraverso i cookies.
 *     responses:
 *       '200':
 *         description: Successo. Viene restituito un nuovo access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: Il nuovo token di accesso generato.
 *       '400':
 *         description: Token o device ID mancanti.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 *       '403':
 *         description: Il token non è valido o è scaduto.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 *       '500':
 *         description: Errore del server.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Dettagli dell'errore.
 */
router.post('/refresh-token', async (req, res) => {
  try {
  const refreshToken = req.cookies.refreshToken;
  const deviceId  = req.cookies.deviceId;


  if (!refreshToken || !deviceId) {
    return res.status(400).json({ message: 'Token o device ID mancante.' });
  }
    
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const device = await UserDevices.findOne({ _id: deviceId, user: decoded.id, refreshToken });
    if (!device) return res.status(403).json({ message: 'Token non valido.' });

    const payload = {
      id: decoded.id,
      role: decoded.role,
      client: decoded.client
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    device.refreshToken = newRefreshToken;
    // aggiorno il timestamp di accesso
    device.lastAccessed = new Date();
    await device.save();

    res.cookie('refreshToken', newRefreshToken, { httpOnly: true,
      secure: true, // solo in HTTPS in prod
      secure: process.env.NODE_ENV === 'production', // true solo in prod (HTTPS)
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 giorni 
      });
    
      res.cookie('deviceId', device._id.toString(), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      });
    return res.json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(403).json({ message: 'Token non valido o scaduto.' + err});
  }
});


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Effettua il logout dell'utente.
 *     description: Rimuove il refresh token dal client e lo elimina dal database, effettuando il logout dell'utente.
 *     tags:
 *       - Auth
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout effettuato con successo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Logout effettuato'
 *       400:
 *         description: Impossibile effettuare il logout, refresh token non trovato nel cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Refresh token non trovato nel cookie.'
 *       500:
 *         description: Errore del server durante il logout.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Errore del server.'
 */
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await UserDevices.findOneAndDelete({ refreshToken });
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout effettuato' });
});


module.exports = router;