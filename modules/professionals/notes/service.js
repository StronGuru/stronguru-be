const Professional = require('../../../models/discriminators/Professional');
const mongoose = require('mongoose');
const throwError = require('../../../helpers/throwError');
const MESSAGES = require('../../../constants/messages');

// Operazioni CRUD per le note personali
exports.getAllNotes = async (professionalId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId).select('personalNotes');
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  return professional.personalNotes || [];
};

exports.getNoteById = async (professionalId, noteId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const note = professional.personalNotes.id(noteId);
  if (!note) {
    throwError('Note not found', 404);
  }

  return note;
};

exports.createNote = async (professionalId, noteData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  professional.personalNotes.push(noteData);
  await professional.save();

  return professional.personalNotes[professional.personalNotes.length - 1];
};

exports.updateNote = async (professionalId, noteId, noteData, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const note = professional.personalNotes.id(noteId);
  if (!note) {
    throwError('Note not found', 404);
  }

  Object.keys(noteData).forEach(key => {
    if (noteData[key] !== undefined) {
      note[key] = noteData[key];
    }
  });

  await professional.save();
  return note;
};

exports.deleteNote = async (professionalId, noteId, userId) => {
  if (professionalId !== userId.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const professional = await Professional.findById(professionalId);
  if (!professional) {
    throwError(MESSAGES.GENERAL.PROFESSIONAL_NOT_FOUND, 404);
  }

  const note = professional.personalNotes.id(noteId);
  if (!note) {
    throwError('Note not found', 404);
  }

  professional.personalNotes.pull(noteId);
  await professional.save();
};