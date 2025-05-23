const express = require('express');
const router = express.Router();
const { USER_ROLES } = require('../../constants/userRoles');
const authMiddleware = require('../../middleware/auth');
const UserController = require('./controller');

// Admin only
router.get('/', authMiddleware(USER_ROLES.ADMIN), UserController.getAllUsers);
router.get('/ambassadors', authMiddleware(USER_ROLES.ADMIN), UserController.getAllAmbassadors);
router.patch('/:id/ambassador', authMiddleware(USER_ROLES.ADMIN), UserController.toggleAmbassador);

// Authenticated user
router.patch('/:id/password', authMiddleware(), UserController.changePassword);

//User settings
router.get('/settings', authMiddleware(), UserController.getOwnSettings);
router.patch('/settings', authMiddleware(), UserController.updateOwnSettings);

module.exports = router;
