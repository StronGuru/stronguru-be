const express = require('express');
const router = express.Router();
const professionalController = require('./controller');
const auth = require('../../middleware/auth');
const validationErrorHandler = require('../../middleware/validators/validationErrorHandler');
const { updateProfessionalValidator } = require('../../middleware/validators/professionalValidator');

// Importa le rotte per qualifiche e certificazioni
const qualificationsRoutes = require('./qualifications/routes');
const certificationsRoutes = require('./certifications/routes');

// Rotte principali per i professionisti
router.get('/', auth(), professionalController.getAllProfessionals);
router.get('/:professionalId', auth(), professionalController.getProfessionalProfile);
router.patch('/:professionalId', auth(), updateProfessionalValidator, validationErrorHandler, professionalController.updateProfessionalProfile);
router.delete('/:professionalId', auth(), professionalController.deleteProfessionalAccount);

// Collega le rotte per qualifiche e certificazioni
router.use('/:professionalId/qualifications', qualificationsRoutes);
router.use('/:professionalId/certifications', certificationsRoutes);

module.exports = router;
