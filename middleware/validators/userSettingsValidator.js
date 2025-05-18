const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// ⚙️ User settings update validator
exports.updateUserSettingsValidator = [
  // UI language setting
  body('language')
    .optional()
    .isIn(['en', 'it', 'de', 'fr'])
    .withMessage(MESSAGES.VALIDATION.INVALID_LANGUAGE),

  // Dark mode preference
  body('darkmode')
    .optional()
    .isBoolean()
    .withMessage(MESSAGES.VALIDATION.INVALID_DARKMODE),

  // Time format preference
  body('dateTimeFormat')
    .optional()
    .isIn(['12h', '24h'])
    .withMessage(MESSAGES.VALIDATION.INVALID_DATETIME_FORMAT),

  // Time zone setting
  body('timeZone')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_TIMEZONE),
];
