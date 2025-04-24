const express = require('express');
const router = express.Router();
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendTemplateEmail = require("../config/emailService");
const UserToken = require("../models/UserToken");
require('dotenv').config();
const { USER_ROLES } = require('../constants/userRoles');
const Professional = require('../models/discriminators/Professional');
const ClientUser = require('../models/discriminators/ClientUser');
const { filterValidSpecializations, assignSpecToProfessional } = require('../helpers/SpecValidation');
const UserDevices = require('../models/UserDevices');
const { generateAccessToken, generateRefreshToken } = require('../helpers/tokenUtils');
const UserSettings = require('../models/UserSettings');
const MESSAGES = require('../constants/messages');


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
            specializations,
            taxCode,
            pIva,
            contactEmail,
            contactPhone,
            address,
            acceptedTerms,
            acceptedPrivacy
        } = req.body;

        // Verifica se l'utente esiste già
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.EMAIL_IN_USE });
        }


        const validSpecializations = filterValidSpecializations(specializations);
        console.log("specializzazioni valide: " + validSpecializations)

        if (validSpecializations.length === 0) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.INVALID_SPECIALIZATION });
          }

        if (!acceptedTerms || !acceptedPrivacy) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.MISSING_TERMS });
        }

        professional = new Professional({
            firstName,
            lastName, 
            email, 
            password, 
            dateOfBirth, 
            gender, 
            phone, 
            role: USER_ROLES.PROFESSIONAL,
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

        if(professional.role !== USER_ROLES.PROFESSIONAL) {
          return res.status(400).json({ message: MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role });
      }

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
            message: MESSAGES.SIGNUP.SUCCESS_PROFESSIONAL,
            userId: professional._id,
            activationKey: activationToken
        });
    } catch (err) {

        if (professional) {
            await Professional.deleteOne({ _id: professional._id }); // Rimuove il professional creato
            await UserToken.deleteOne({userId: professional._id});
        }
        console.error('Signup error:', err);

        res.status(400).json({
            message: MESSAGES.GENERAL.SERVER_ERROR,
            error: err.message
        });
    }
});

// POST /signup/user
router.post('/signup/user', async (req, res) => {

  let clientUser = null;

  try {
      const { 
          firstName, 
          lastName, 
          email, 
          password, 
          dateOfBirth,
          gender, 
          phone,
          acceptedTerms,
          acceptedPrivacy
      } = req.body;

      

      // Verifica se l'utente esiste già
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: MESSAGES.SIGNUP.EMAIL_IN_USE });
      }


      if (!acceptedTerms || !acceptedPrivacy) {
          return res.status(400).json({ message: MESSAGES.SIGNUP.MISSING_TERMS });
      }

      clientUser = new ClientUser({
          firstName,
          lastName, 
          email, 
          password, 
          dateOfBirth, 
          gender, 
          phone, 
          acceptedTerms,
          acceptedPrivacy
      });

      await clientUser.save();

      if(clientUser.role !== USER_ROLES.USER) {
        return res.status(400).json({ message: MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role });
    }

      await new UserSettings({
        user: clientUser._id
      }).save();

      const activationToken = crypto.randomBytes(32).toString("hex");

      await new UserToken({
          userId: clientUser._id,
          token: activationToken,
          type: "activation",
      }).save();

      await sendTemplateEmail({
        to: clientUser.email,
        templateKey: 'REGISTRATION',
        dynamicData: {
          activationToken: activationToken
        }
      })

      console.log(`Email inviata a: ${clientUser.email}, con Token: ${activationToken.slice(0, 5)}...`);

      res.status(201).json({
          message: MESSAGES.SIGNUP.SUCCESS_USER,
          userId: clientUser._id,
          activationKey: activationToken
      });
  } catch (err) {

      if (clientUser) {
          await ClientUser.deleteOne({ _id: clientUser._id }); // Rimuove il ClientUser creato
          await UserToken.deleteOne({userId: clientUser._id});
      }
      console.error('Signup error:', err);

      res.status(400).json({
          message: MESSAGES.GENERAL.SERVER_ERROR,
          error: err.message
      });
  }
});


// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password} = req.body;
    const deviceType = req.useragent.isMobile || req.useragent.isTablet
  ? 'mobile'
  : 'desktop';

    // Validazione di base
  if (!email || !password) {
    return res.status(400).json({ message: MESSAGES.AUTH.MISSING_CREDENTIALS });
  }
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });

     // Controllo tipo dispositivo ↔ ruolo
  if (deviceType === 'mobile' && user.role !== USER_ROLES.USER) {
    return res.status(403).json({ message: MESSAGES.AUTH.ROLE_NOT_ALLOWED_MOBILE + ': ' + user.role });
  }

  if (deviceType === 'desktop' && ![USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN].includes(user.role)) {
    return res.status(403).json({ message: MESSAGES.AUTH.ROLE_NOT_ALLOWED_DESKTOP + ': ' + user.role });
  }

    // Check if email is verified
    if (!user.isVerified) {
        return res.status(401).json({ 
            message: MESSAGES.AUTH.EMAIL_NOT_VERIFIED + ': ' + user.email 
        });
    }

  

    const payload = { 
        id: user.id,
        role: user.role,
        deviceType: deviceType };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);


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
    res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR + ' ' + err });
  }
});

// POST /auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
  const refreshToken = req.cookies.refreshToken;
  const deviceId  = req.cookies.deviceId;


  if (!refreshToken || !deviceId) {
    return res.status(400).json({ message: MESSAGES.AUTH.TOKEN_MISSING });
  }
    
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const device = await UserDevices.findOne({ _id: deviceId, user: decoded.id, refreshToken });
    if (!device) return res.status(403).json({ message: MESSAGES.AUTH.DEVICE_INVALID });

    const payload = {
      id: decoded.id,
      role: decoded.role,
      deviceType: decoded.deviceType
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
    return res.status(403).json({ message: MESSAGES.TOKEN.INVALID_OR_EXPIRED + ' ' + err});
  }
});


// POST /auth/logout
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await UserDevices.findOneAndDelete({ refreshToken });
  res.clearCookie('refreshToken');
  res.status(200).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
});


module.exports = router;