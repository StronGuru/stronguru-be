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
router.get('/:id', auth(), professionalController.getProfessionalProfile);
router.patch('/:id', auth(), updateProfessionalValidator, validationErrorHandler, professionalController.updateProfessionalProfile);
router.delete('/:id', auth(), professionalController.deleteProfessionalAccount);

// Collega le rotte per qualifiche e certificazioni
router.use('/:id/qualifications', qualificationsRoutes);
router.use('/:id/certifications', certificationsRoutes);

module.exports = router;
