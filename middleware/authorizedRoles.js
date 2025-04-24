const MESSAGES = require('../constants/messages');

module.exports = function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: MESSAGES.AUTH.TOKEN_MISSING });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: MESSAGES.GENERAL.UNAUTHORIZED_ACCESS });
        }
        
        next();
    };
};