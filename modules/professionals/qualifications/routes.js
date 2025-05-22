const express = require('express');
const router = express.Router({ mergeParams: true });
const qualificationController = require('./controller');
const auth = require('../../../middleware/auth');
const validationErrorHandler = require('../../../middleware/validators/validationErrorHandler');
const { updateProfessionalValidator } = require('../../../middleware/validators/professionalValidator');

// Rotte per le qualifiche
router.get('/', auth(), qualificationController.getAllQualifications);
router.get('/:qualificationId', auth(), qualificationController.getQualificationById);
router.post('/', auth(), updateProfessionalValidator, validationErrorHandler, qualificationController.createQualification);
router.put('/:qualificationId', auth(), updateProfessionalValidator, validationErrorHandler, qualificationController.updateQualification);
router.delete('/:qualificationId', auth(), qualificationController.deleteQualification);

module.exports = router;