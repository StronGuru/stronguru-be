const { PROFESSIONAL_SPECIALIZATIONS } = require('../constants/professionalSpecializations');
const Nutritionist = require('../models/Nutritionist');
const Psychologist = require('../models/Psychologist');
const Trainer = require('../models/Trainer');

const SPECIALIZATION_MODELS = {
    [PROFESSIONAL_SPECIALIZATIONS.NUTRITIONIST]: Nutritionist,
    [PROFESSIONAL_SPECIALIZATIONS.TRAINER]: Trainer,
    [PROFESSIONAL_SPECIALIZATIONS.PSYCHOLOGIST]: Psychologist,
  };

module.exports = SPECIALIZATION_MODELS;