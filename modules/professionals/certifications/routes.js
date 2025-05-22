const express = require('express');
const router = express.Router({ mergeParams: true });
const certificationController = require('./controller');
const auth = require('../../../middleware/auth');
const validationErrorHandler = require('../../../middleware/validators/validationErrorHandler');
const { updateProfessionalValidator } = require('../../../middleware/validators/professionalValidator');

// Rotte per le certificazioni
router.get('/', auth(), certificationController.getAllCertifications);
router.get('/:certificationId', auth(), certificationController.getCertificationById);
router.post('/', auth(), updateProfessionalValidator, validationErrorHandler, certificationController.createCertification);
router.put('/:certificationId', auth(), updateProfessionalValidator, validationErrorHandler, certificationController.updateCertification);
router.delete('/:certificationId', auth(), certificationController.deleteCertification);

module.exports = router;