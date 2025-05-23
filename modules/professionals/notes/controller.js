const noteService = require('./service');

// Controller per le note personali
exports.getAllNotes = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const notes = await noteService.getAllNotes(professionalId, req.user._id);
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

exports.getNoteById = async (req, res, next) => {
  try {
    const { professionalId, noteId } = req.params;
    const note = await noteService.getNoteById(professionalId, noteId, req.user._id);
    res.json(note);
  } catch (error) {
    next(error);
  }
};

exports.createNote = async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const newNote = await noteService.createNote(professionalId, req.body, req.user._id);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

exports.updateNote = async (req, res, next) => {
  try {
    const { professionalId, noteId } = req.params;
    const updatedNote = await noteService.updateNote(
      professionalId,
      noteId,
      req.body,
      req.user._id
    );
    res.json(updatedNote);
  } catch (error) {
    next(error);
  }
};

exports.deleteNote = async (req, res, next) => {
  try {
    const { professionalId, noteId } = req.params;
    await noteService.deleteNote(professionalId, noteId, req.user._id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};