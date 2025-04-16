const { default: mongoose } = require("mongoose");

const UserSettingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },    
    darkmode: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: 'it' // italiano di default
      },
      dateTimeFormat: {
        type: String,
        enum: ['24h', '12h'],
        default: '24h'
      },
      timeZone: {
        type: String,
        default: Intl.DateTimeFormat().resolvedOptions().timeZone // timezone locale del server
      }
}, {
    timestamps: true
  });

  module.exports = mongoose.model('UserSettings', UserSettingsSchema);