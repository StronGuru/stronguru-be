const ProfessionalService = require('./service');

exports.getAllProfessionals = async (req, res, next) => {
  try {
    const professionals = await ProfessionalService.getAllProfessionals();
    res.status(200).json(professionals);
  } catch (error) {
    next(error);
  }
};

exports.getProfessionalProfile = async (req, res, next) => {
  try {
    const professional = await ProfessionalService.getProfessionalProfile(req.params.id, req.user);
    res.status(200).json(professional);
  } catch (error) {
    next(error);
  }
};

exports.updateProfessionalProfile = async (req, res, next) => {
  try {
    const updatedProfessional = await ProfessionalService.updateProfessionalProfile(req.params.id, req.user._id, req.body);
    res.status(200).json({ message: 'Profile updated successfully', professionalId: updatedProfessional._id });
  } catch (error) {
    next(error);
  }
};

exports.deleteProfessionalAccount = async (req, res, next) => {
  try {
    const result = await ProfessionalService.deleteProfessionalAccount(req.params.id, req.user._id, req.body.password);
    res.status(200).json({ message: result });
  } catch (error) {
    next(error);
  }
};
