const express = require('express');
const router = express.Router({ mergeParams: true });
const noteController = require('./controller');
const auth = require('../../../middleware/auth');

// Rotte per le note personali
router.get('/', auth(), noteController.getAllNotes);
router.get('/:noteId', auth(), noteController.getNoteById);
router.post('/', auth(), noteController.createNote);
router.put('/:noteId', auth(), noteController.updateNote);
router.delete('/:noteId', auth(), noteController.deleteNote);

module.exports = router;