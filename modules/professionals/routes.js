const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const { USER_ROLES } = require('../../constants/userRoles');
const ProfessionalController = require('./controller');

// Admin only
router.get('/', authMiddleware(USER_ROLES.ADMIN), ProfessionalController.getAllProfessionals);

// Authenticated professional
router.get('/:id', authMiddleware(), ProfessionalController.getProfessionalProfile);
router.patch('/:id', authMiddleware(), ProfessionalController.updateProfessionalProfile);
router.delete('/:id', authMiddleware(), ProfessionalController.deleteProfessionalAccount);

module.exports = router;
