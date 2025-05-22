const passport = require('passport');
const UserDevices = require('../models/UserDevices');
const MESSAGES = require('../constants/messages');

module.exports = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, async (err, user) => {

      if (err) {
        console.error('Auth error:', err);
        return res.status(500).json({ msg: MESSAGES.GENERAL.SERVER_ERROR });
      }

      if (!user) return res.status(401).json({ msg: MESSAGES.AUTH.TOKEN_MISSING });

      console.log('User from JWT:', user);
      
      // Estrai deviceId dal token JWT invece che dall'header
      const deviceId = user.deviceId;
      console.log('Device ID dal JWT:', deviceId);

      const deviceExists = await UserDevices.findOne({user: user.id, _id: deviceId });
      if (!deviceExists) return res.status(401).json({ msg: MESSAGES.AUTH.DEVICE_INVALID });

      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Access denied for role: ${user.role}`)
        return res.status(403).json({ msg: MESSAGES.GENERAL.UNAUTHORIZED_ACCESS });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};
