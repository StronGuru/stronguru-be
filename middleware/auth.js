const passport = require('passport');

module.exports = (roles = []) => {
  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) return res.status(401).json({ msg: 'Accesso negato' });

      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ msg: 'Permessi insufficienti' });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};
