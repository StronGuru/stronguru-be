const passport = require('passport');
const UserDevices = require('../models/UserDevices');

module.exports = (roles = []) => {
  if (typeof roles === 'string') roles = [roles]; //permette sia una stringa che un array

  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {

      //aggiunta messaggi di errore più dettagliati -Ms
      if (err) {
        console.error('Errore autenticazione:', err);
        return res.status(500).json({ msg: 'Errore autenticazione'});
      }

      if (!user) return res.status(401).json({ msg: 'Token non valido o utente non trovato'});
       // Qui puoi fare un controllo extra:
      const deviceExists = UserDevices.findOne({user: user.id, _id: req.cookies.deviceId })
      console.log(deviceExists);
      if (!deviceExists) return res.status(401).json({ msg: 'Dispositivo non più valido'});

      if (roles.length && !roles.includes(user.role)) {
        console.warn(`Accesso negato per ruolo: ${user.role}`)// per il debug -Ms
        return res.status(403).json({ msg: 'Permessi insufficienti' });
      }

      req.user = user;
      next();
    })(req, res, next);
  };
};
