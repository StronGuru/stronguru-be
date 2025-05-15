const mongoose = require('mongoose');
const CommonAddressSchema = require('./CommonAddress');

const ClientUserProfileSchema = new mongoose.Schema({
    clientUserId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    professionalId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
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
    state: {
        type: String,
        enum: ['pending', 'invited', 'active'],
        //default: 'invited'
      },
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