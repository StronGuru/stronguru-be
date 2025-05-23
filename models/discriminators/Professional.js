const { default: mongoose } = require("mongoose");
const User = require('../User');
const { PROFESSIONAL_SPECIALIZATIONS } = require('../../constants/professionalSpecializations');
const { USER_ROLES } = require('../../constants/userRoles');
const QualificationSchema = require("../schemas/QualificationSchema");
const CertificationSchema = require("../schemas/CertificationSchema");
const ProfessionalNoteSchema = require("../schemas/ProfessionalNoteSchema");

const ProfessionalSchema = new mongoose.Schema({
    specializations: [{
        type: String,
        enum: Object.values(PROFESSIONAL_SPECIALIZATIONS)
    }],

    taxCode: { type: String },

    //Attività
    pIva: { type: String,
            required: true,
            unique: true, 
     },
    contactEmail: { type: String} ,
    contactPhone: { type: String },

    languages: [{ type: String }],
    
    qualifications: [QualificationSchema],
    
    certifications: [CertificationSchema],
    
    personalNotes: [ProfessionalNoteSchema]
    
}, {timestamps: true});

module.exports = User.discriminator(USER_ROLES.PROFESSIONAL, ProfessionalSchema);