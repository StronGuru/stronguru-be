const { default: mongoose } = require("mongoose");

const ProfessionalNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    description: "Note title",
    required: true
  },
  content: {
    type: String,
    description: "Note content",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    description: "Creation date of the note"
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    description: "Last update date of the note"
  }
}, { timestamps: true });

module.exports = ProfessionalNoteSchema;