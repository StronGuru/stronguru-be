const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const { USER_ROLES } = require('../../constants/userRoles');
const ClientUserController = require('./controller');
const validate = require('../../middleware/validators/validationErrorHandler');
const { updateClientUserValidator } = require('../../middleware/validators/clientUserValidator');

// Admin only
router.get('/', authMiddleware(USER_ROLES.ADMIN), ClientUserController.getAllClientUsers);

// Authenticated client user
router.get('/:id', authMiddleware(), ClientUserController.getClientUserProfile);
router.patch('/:id', authMiddleware(),updateClientUserValidator, validate, ClientUserController.updateClientUserProfile);
router.delete('/:id', authMiddleware(), ClientUserController.deleteClientUserAccount);

module.exports = router;
