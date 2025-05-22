const Professional = require('../../../models/discriminators/Professional');
const mongoose = require('mongoose');
const throwError = require('../../../helpers/throwError');
const MESSAGES = require('../../../constants/messages');

// Operazioni CRUD per le qualifiche
exports.getAllQualifications = async (professionalId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId).select('qualifications');
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  return professional.qualifications || [];
};

exports.getQualificationById = async (professionalId, qualificationId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const qualification = professional.qualifications.id(qualificationId);
  if (!qualification) {
    throwError('Qualifica non trovata', 404);
  }

  return qualification;
};

exports.createQualification = async (professionalId, qualificationData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  professional.qualifications.push(qualificationData);
  await professional.save();

  return professional.qualifications[professional.qualifications.length - 1];
};

exports.updateQualification = async (professionalId, qualificationId, qualificationData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const qualification = professional.qualifications.id(qualificationId);
  if (!qualification) {
    throwError('Qualifica non trovata', 404);
  }

  // Aggiorna i campi della qualifica
  Object.keys(qualificationData).forEach(key => {
    qualification[key] = qualificationData[key];
  });

  await professional.save();
  return qualification;
};

exports.deleteQualification = async (professionalId, qualificationId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const qualification = professional.qualifications.id(qualificationId);
  if (!qualification) {
    throwError('Qualifica non trovata', 404);
  }

  qualification.remove();
  await professional.save();

  return { message: 'Qualifica eliminata con successo' };
};