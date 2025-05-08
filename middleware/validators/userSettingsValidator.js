const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

exports.updateUserSettingsValidator = [
  body('language')
    .optional()
    .isIn(['en', 'it', 'de', 'fr'])
    .withMessage(MESSAGES.VALIDATION.INVALID_LANGUAGE),

  body('darkmode')
    .optional()
    .isBoolean()
    .withMessage(MESSAGES.VALIDATION.INVALID_DARKMODE),

  body('dateTimeFormat')
    .optional()
    .isIn(['12h', '24h'])
    .withMessage(MESSAGES.VALIDATION.INVALID_DATETIME_FORMAT),

  body('timeZone')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_TIMEZONE)
];
