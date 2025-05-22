const { default: mongoose } = require("mongoose");

// Reference schema for user qualifications
const QualificationSchema = new mongoose.Schema({
  degreeTitle: {
    type: "String",
    description: "Academic degree (e.g. Diploma, Bachelor's Degree, Master's Degree, PhD, etc.)",
    required: true
  },
  institution: {
    type: "String",
    description: "Name of the institution that issued the degree",
    required: true
  },
  fieldOfStudy: {
    type: "String",
    description: "Field of study (e.g. Sport Sciences, Nutrition and Food Sciences, etc.)",
    required: true
  },
  startDate: {
    type: "Date",
    format: "DD/MM/YYYY",
    description: "Start date of studies",
    required: true
  },
  completionDate: {
    type: "Date",
    format: "DD/MM/YYYY",
    description: "Date when the degree was obtained",
    required: true
  }
});

module.exports = QualificationSchema;