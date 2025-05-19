const { default: mongoose } = require("mongoose");

// Reference schema for user certifications
const CertificationSchema = new mongoose.Schema({
  certificationName: {
    type: "String",
    description: "Name of the certification",
    required: true
  },
  issuingOrganization: {
    type: "String",
    description: "Name of the organization that issued the certification",
    required: true
  },
  level: {
    type: "String",
    description: "Level or grade of the certification (e.g. B2, Basic Level, Professional)",
    required: false
  },
  certificationId: {
    type: "String",
    description: "Official identification number of the certification",
    required: false
  },
  certificationUrl: {
    type: "String",
    description: "URL link to the certification",
    required: false
  },
  issueDate: {
    type: "Date",
    format: "DD/MM/YYYY",
    description: "Date when the certification was issued",
    required: true
  },
  expirationDate: {
    type: "Date",
    format: "DD/MM/YYYY",
    description: "Expiration date of the certification (if applicable)",
    required: false
  },
}, {_id: false} );

module.exports = CertificationSchema;