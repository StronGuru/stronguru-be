const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Per la gestione delle password
const jwt = require('jsonwebtoken'); // Per la gestione dei token JWT

const customerEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'pending', 'inactive'],
        default: 'pending'
    }
});

const certificateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    entity: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true }
});

const settingsSchema = new mongoose.Schema({
    language: { type: String, default: 'it' },
    allowEmail: { type: Boolean, default: true },
    allowNewPatients: { type: Boolean, default: true },
    showNumber: { type: Boolean, default: true }
});

const workingLocationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    isMainLocation: { type: Boolean, default: false },
});

const customerGroupSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String 
    },
    sport: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    customers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    trainings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workout'
    }],
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const professionistSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    country: { type: String, required: true },
    instagram: { type: String },
    linkedin: { type: String },
    whatsapp: { type: String },
    phone: { type: String },
    verificationToken: { type: String },
    isVerified: { type: Boolean, default: false },
    customersList: [customerEntrySchema],
    customerGroups: [customerGroupSchema],
    role: { type: String, enum: ['Allenatore', 'Dietologo', 'Psicologo'] },
    resetPasswordToken: {
        type: String,
        default: undefined
    },
    resetPasswordExpires: {
        type: Date,
        default: undefined
    },
    certificates: [certificateSchema],
    education: [certificateSchema],
    settings: { type: settingsSchema, default: {} },
    workingLocations: [workingLocationSchema],
}, { timestamps: true });

// Hash della password prima di salvarla nel database
professionistSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next(); // Se la password non è modificata, non fare nulla
    const salt = await bcrypt.genSalt(10); // Genera un sale
    this.password = await bcrypt.hash(this.password, salt); // Hash della password
    next();
});

// Metodo per confrontare la password durante il login
professionistSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Metodo per generare il JWT per l'autenticazione
professionistSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { _id: this._id, email: this.email, role: this.role },
        'secretKey',
        { expiresIn: '1h' }
    );
    return token;
};

const Professionists = mongoose.model('Professionists', professionistSchema);
module.exports = Professionists;
