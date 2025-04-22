const { default: mongoose } = require("mongoose");
const { USER_ROLES } = require('../../constants/userRoles');
const User = require('../User');

const AthleteSchema = new mongoose.Schema({

})

module.exports = User.discriminator(USER_ROLES.ATHLETE, AthleteSchema);