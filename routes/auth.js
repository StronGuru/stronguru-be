const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('dotenv').config();
const { default: mongoose } = require('mongoose');

const User = require('../models/User');
const Professional = require('../models/discriminators/Professional');
const UserDevices = require('../models/UserDevices');
const UserSettings = require('../models/UserSettings');
const UserToken = require("../models/UserToken");
const { USER_ROLES } = require('../constants/userRoles');

const sendTemplateEmail = require("../config/emailService");
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const { generateAccessToken, generateRefreshToken } = require('../helpers/tokenUtils');

// POST /signup/professional
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


// POST /auth/login
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

// POST /auth/refresh-token
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


// POST /auth/logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await UserDevices.findOneAndDelete({ refreshToken });
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout effettuato' });
});


module.exports = router;