const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = require('../models/User');
const MESSAGES = require('../constants/messages');

//già presente in index.js - Superfluo? - Ms
require('dotenv').config(); // Per leggere le variabili d'ambiente

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      try {
        const user = await User.findById(jwt_payload.id);
        if (user) return done(null, user);
        return done(null, false);
      } catch (err) {
        console.error(MESSAGES.GENERAL.SERVER_ERROR, err)
        return done(err, false);
      }
    })
  );
};