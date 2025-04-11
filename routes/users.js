const express = require('express');
const router = express.Router();
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
require('dotenv').config(); // Per leggere le variabili d'ambiente
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


module.exports = router;
