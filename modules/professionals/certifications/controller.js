const certificationService = require('./service');

// Controller per le certificazioni
exports.getAllCertifications = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const certifications = await certificationService.getAllCertifications(professionalId, req.user._id);
    res.json(certifications);
  } catch (error) {
    next(error);
  }
};

exports.getCertificationById = async (req, res, next) => {
  try {
    const { professionalId, certificationId } = req.params;
    const certification = await certificationService.getCertificationById(professionalId, certificationId, req.user._id);
    res.json(certification);
  } catch (error) {
    next(error);
  }
};

exports.createCertification = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const newCertification = await certificationService.createCertification(professionalId, req.body, req.user._id);
    res.status(201).json(newCertification);
  } catch (error) {
    next(error);
  }
};

exports.updateCertification = async (req, res, next) => {
  try {
    const { professionalId, certificationId } = req.params;
    const updatedCertification = await certificationService.updateCertification(
      professionalId,
      certificationId,
      req.body,
      req.user._id
    );
    res.json(updatedCertification);
  } catch (error) {
    next(error);
  }
};

exports.deleteCertification = async (req, res, next) => {
  try {
    const { professionalId, certificationId } = req.params;
    const result = await certificationService.deleteCertification(professionalId, certificationId, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};