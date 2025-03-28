const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Per la gestione delle password
const jwt = require('jsonwebtoken'); // Per la gestione dei token JWT

const measurementSchema = new mongoose.Schema({
    weight: Number,
    bodyFat: Number,
    chest: Number,
    waist: Number,
    thighs: Number,
    arms: Number,
    height: Number,
    date: {
        type: Date,
        default: Date.now
    },
});

const historyOrderSchema = new mongoose.Schema({
    productList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    date: { type: Date, default: Date.now },
    totalPrice: Number,
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'bankTransfer'], default: 'cash' },
    deliveryMethod: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryAddress: String,
    deliveryDate: Date,
    notes: String
});

const maxLiftsSchema = new mongoose.Schema({
    name: String,
    weight: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const allergenSchema = new mongoose.Schema({
    name: String,
    description: String,
});

const gymPresenceSchema = new mongoose.Schema({
    presence: Boolean,
    date: {
        type: Date,
        default: Date.now
    }
});

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    dietPlan: { type: Boolean, default: false },
    dietPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Diet' }],
    trainingPlan: { type: Boolean, default: false },
    trainingPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
    psychoPlan: { type: Boolean, default: false },
    measurements: measurementSchema,
    measureHistory: [measurementSchema],
    maxLifts: [maxLiftsSchema],
    allergens: [allergenSchema],
    gymPresence: [gymPresenceSchema],
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    isVerified: { type: Boolean, default: false },
    dryOrder: [orderItemSchema],
    orderHistory: [orderSchema],
    role: { type: String, enum: ['nutrizionista', 'psicologo', 'dietologo', 'admin', 'user'], required: true, default: "user"},
}, { timestamps: true });

// Hash della password prima di salvarla nel database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Se la password non è modificata, non fare nulla
    const salt = await bcrypt.genSalt(10); // Genera un sale
    this.password = await bcrypt.hash(this.password, salt); // Hash della password
    next();
});

// Metodo per confrontare la password durante il login
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Metodo per generare il JWT per l'autenticazione
// userSchema.methods.generateAuthToken = function () {
//     const token = jwt.sign(
//         { _id: this._id, email: this.email, role: this.role }, // Include il ruolo nel token
//         'secretKey',
//         { expiresIn: '1h' }
//     );
//     return token;
// };

const User = mongoose.model('User', userSchema);
module.exports = User;
