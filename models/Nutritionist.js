const { default: mongoose } = require("mongoose");

const nutritionistSchema = new mongoose.Schema({
    professional: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true,
        unique: true
      },
});

module.exports = mongoose.model('Nutritionist', nutritionistSchema);
