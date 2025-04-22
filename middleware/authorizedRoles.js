module.exports = function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Utente non autenticato'});
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Accesso negato: permessi insufficienti' });
        }
        
        next();
    };
};