const passport = require('passport');

module.exports = (roles = []) => {
  if (typeof roles === 'string') roles = [roles]; //permette sia una stringa che un array

  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {

      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Accesso negato per ruolo: ${user.role}`)// per il debug -Ms
        return res.status(403).json({ msg: 'Permessi insufficienti' });
      }

      //aggiunta messaggi di errore più dettagliati -Ms
      if (err) {
        console.error('Errore autenticazione:', err);
        return res.status(500).json({ msg: 'Errore autenticazione'});
      }

      if (!user) return res.status(401).json({ msg: 'Token non valido o utente non trovato'});

      req.user = user;
      next();
    })(req, res, next);
  };
};
