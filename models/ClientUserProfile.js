const mongoose = require('mongoose');
const CommonAddressSchema = require('./CommonAddress');

const ClientUserProfileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        required: false,
        trim: true,
    },
    address: CommonAddressSchema,
    dateOfBirth: {
        type: Date,
        required: false,
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
     }, // il professionista che lo ha creato
  connectedUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', default: null
     }, // se il cliente ha un account
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

ClientUserProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('ClientUserProfile', ClientUserProfileSchema);