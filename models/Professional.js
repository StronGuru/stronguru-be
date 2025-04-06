const { default: mongoose } = require("mongoose");
const User = require('./User');
const { PROFESSIONAL_SPECIALIZATIONS } = require('../constants/professionalSpecializations');
const { USER_ROLES } = require('../constants/userRoles');


const ProfessionalSchema = new mongoose.Schema({
    specialization: [{
        type: String,
        enum: Object.values(PROFESSIONAL_SPECIALIZATIONS)
    }],
    professionalExperiences: [String],
    certifications: [String],
});

module.exports = User.discriminator(USER_ROLES.PROFESSIONAL, ProfessionalSchema);