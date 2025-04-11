const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Per la gestione delle password
const jwt = require('jsonwebtoken'); // Per la gestione dei token JWT
const { USER_ROLES } = require('../constants/userRoles');
const AddressSchema = require('./CommonAddress');
const SocialLinksSchema = require('./SocialLinks');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    
    //aggiunta validazione semplice per email - Ms
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: [/^\S+@\S+\.\S+$/, 'Email non valida']
    },

    password: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    address: AddressSchema,
    phone: { type: String, required: true },
    biography: { type: String, required: false },
    profileImg: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(USER_ROLES), required: true, default: USER_ROLES.USER},
    ambassador: { type: Boolean, default: false },
    socialLinks: SocialLinksSchema,
    
    //consenso
    acceptedTerms: { type: Boolean, required: true },
    acceptedPrivacy: { type: Boolean, required: true }

}, {discriminatorKey: 'role', timestamps: true });

// Hash della password prima di salvarla nel database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Se la password non è modificata, non fare nulla
    const salt = await bcrypt.genSalt(10); // Genera un sale
    this.password = await bcrypt.hash(this.password, salt); // Hash della password
    next();
});

// Metodo per confrontare la password durante il login
userSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false; //nel caso in cui la password fosse null - Ms
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);