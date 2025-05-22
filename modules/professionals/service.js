const Professional = require('../../models/discriminators/Professional');
const UserDevices = require('../../models/UserDevices');
const UserSettings = require('../../models/UserSettings');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');
const bcrypt = require('bcryptjs');

exports.getAllProfessionals = async () => {
  const professionals = await Professional.find().select('-password');
  return professionals;
};

exports.getProfessionalProfile = async (professionalId, user) => {
  if (user.role !== 'admin' && professionalId !== user._id.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId).select('-password');
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }
  return professional;
};

exports.updateProfessionalProfile = async (professionalIdParam, userIdSession, updateData) => {
  if (professionalIdParam !== userIdSession.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  // Campi che non possono essere aggiornati
  const excludedFields = [
    'password', 'email', 'role', 'isVerified', 'createdAt', 'updatedAt', 'ambassador', 'acceptedPrivacy', 'acceptedTerms'
  ];

  const sanitizedBody = {};

  // Aggiungi tutti i campi tranne quelli esclusi
  Object.keys(updateData).forEach(field => {
    if (!excludedFields.includes(field)) {
      sanitizedBody[field] = updateData[field];
    }
  });

  if (Object.keys(sanitizedBody).length === 0) {
    throwError(MESSAGES.VALIDATION.NO_VALID_FIELDS, 400);
  }

  const professionalUpdated = await Professional.findByIdAndUpdate(
    professionalIdParam,
    { $set: sanitizedBody },
    { new: true }
  ).select('-password');

  if (!professionalUpdated) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  return professionalUpdated;
};

exports.deleteProfessionalAccount = async (professionalIdParam, userIdSession, providedPassword) => {
  if (professionalIdParam !== userIdSession.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalIdParam);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const isMatch = await bcrypt.compare(providedPassword, professional.password);
  if (!isMatch) {
    throwError(MESSAGES.VALIDATION.PASSWORD_MISMATCH, 401);
  }

  // Clean linked data
  await UserDevices.deleteMany({ user: professionalIdParam });
  await UserSettings.deleteMany({ user: professionalIdParam });

  await Professional.findByIdAndDelete(professionalIdParam);

  return MESSAGES.GENERAL.ACCOUNT_DELETED;
};
