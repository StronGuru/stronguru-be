const qualificationService = require('./service');

// Controller per le qualifiche
exports.getAllQualifications = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const qualifications = await qualificationService.getAllQualifications(professionalId, req.user._id);
    res.json(qualifications);
  } catch (error) {
    next(error);
  }
};

exports.getQualificationById = async (req, res, next) => {
  try {
    const { professionalId, qualificationId } = req.params;
    const qualification = await qualificationService.getQualificationById(professionalId, qualificationId, req.user._id);
    res.json(qualification);
  } catch (error) {
    next(error);
  }
};

exports.createQualification = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const newQualification = await qualificationService.createQualification(professionalId, req.body, req.user._id);
    res.status(201).json(newQualification);
  } catch (error) {
    next(error);
  }
};

exports.updateQualification = async (req, res, next) => {
  try {
    const { professionalId, qualificationId } = req.params;
    const updatedQualification = await qualificationService.updateQualification(
      professionalId,
      qualificationId,
      req.body,
      req.user._id
    );
    res.json(updatedQualification);
  } catch (error) {
    next(error);
  }
};

exports.deleteQualification = async (req, res, next) => {
  try {
    const { professionalId, qualificationId } = req.params;
    const result = await qualificationService.deleteQualification(professionalId, qualificationId, req.user._id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};