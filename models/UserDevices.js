const { default: mongoose } = require("mongoose");

const UserDeviceSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      ipAddress: {type: String},         // IP del dispositivo
      lastAccessed: { 
        type: Date, 
        default: Date.now
      },
      userAgent: {type: String},         // Informazioni sul browser o sistema operativo
      refreshToken: { 
        type: String, 
        required: true, 
        unique: true 
      },
      deviceType: {type: String},        // E.g., mobile, desktop
      isActive: { 
        type: Boolean, 
        default: true
      }
}, {timestamps: true});

module.exports = mongoose.model('UserDevice', UserDeviceSchema);