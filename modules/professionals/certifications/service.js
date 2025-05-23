const Professional = require('../../../models/discriminators/Professional');
const mongoose = require('mongoose');
const throwError = require('../../../helpers/throwError');
const MESSAGES = require('../../../constants/messages');

// Operazioni CRUD per le certificazioni
exports.getAllCertifications = async (professionalId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId).select('certifications');
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  return professional.certifications || [];
};

exports.getCertificationById = async (professionalId, certificationId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const certification = professional.certifications.id(certificationId);
  if (!certification) {
    throwError('Certificazione non trovata', 404);
  }

  return certification;
};

exports.createCertification = async (professionalId, certificationData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  professional.certifications.push(certificationData);
  await professional.save();

  return professional.certifications[professional.certifications.length - 1];
};

exports.updateCertification = async (professionalId, certificationId, certificationData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const certification = professional.certifications.id(certificationId);
  if (!certification) {
    throwError('Certificazione non trovata', 404);
  }

  // Aggiorna solo i campi forniti, mantenendo gli altri intatti
  Object.keys(certificationData).forEach(key => {
    if (certificationData[key] !== undefined) {
      certification[key] = certificationData[key];
    }
  });

  await professional.save();
  return certification;
};

exports.deleteCertification = async (professionalId, certificationId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const certification = professional.certifications.id(certificationId);
  if (!certification) {
    throwError('Certificazione non trovata', 404);
  }

  professional.certifications.pull(certificationId);
  await professional.save();

  return { message: 'Certificazione eliminata con successo' };
};