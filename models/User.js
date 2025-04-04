const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Per la gestione delle password
const jwt = require('jsonwebtoken'); // Per la gestione dei token JWT

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
    dateOfBirth: { type: Date, required: true }, //data di nascita come data invece che stringa - Ms
    gender: { type: String, required: true },
    phone: { type: String, required: true },
    biography: { type: String, required: false },
    profileImg: { type: String, required: false },
    isVerified: { type: Boolean, default: false },
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
    if (!this.password) return false; //nel caso in cui la password fosse null - Ms
    return await bcrypt.compare(password, this.password);
};

// const measurementSchema = new mongoose.Schema({
//     weight: Number,
//     bodyFat: Number,
//     chest: Number,
//     waist: Number,
//     thighs: Number,
//     arms: Number,
//     height: Number,
//     date: {
//         type: Date,
//         default: Date.now
//     },
// });

// const historyOrderSchema = new mongoose.Schema({
//     productList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
//     date: { type: Date, default: Date.now },
//     totalPrice: Number,
//     status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
//     paymentMethod: { type: String, enum: ['cash', 'card', 'bankTransfer'], default: 'cash' },
//     deliveryMethod: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
//     deliveryAddress: String,
//     deliveryDate: Date,
//     notes: String
// });

// const maxLiftsSchema = new mongoose.Schema({
//     name: String,
//     weight: Number,
//     date: {
//         type: Date,
//         default: Date.now
//     }
// });

// const allergenSchema = new mongoose.Schema({
//     name: String,
//     description: String,
// });

// const gymPresenceSchema = new mongoose.Schema({
//     presence: Boolean,
//     date: {
//         type: Date,
//         default: Date.now
//     }
// });

// const orderItemSchema = new mongoose.Schema({
//     product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Product',
//         required: true
//     },
//     quantity: {
//         type: Number,
//         required: true,
//         min: 1
//     },
//     price: {
//         type: Number,
//         required: true
//     }
// });

// const orderSchema = new mongoose.Schema({
//     items: [orderItemSchema],
//     totalAmount: {
//         type: Number,
//         required: true
//     },
//     status: {
//         type: String,
//         enum: ['pending', 'completed', 'cancelled'],
//         default: 'pending'
//     },
//     orderDate: {
//         type: Date,
//         default: Date.now
//     }
// });



const User = mongoose.model('User', userSchema);
module.exports = User;
