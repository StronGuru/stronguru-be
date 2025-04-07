const { default: mongoose } = require("mongoose");

const psychologistSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
      },
});

module.exports = mongoose.model('Psychologist', psychologistSchema);
