const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

exports.updateProfessionalValidator = [
  body('firstName')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_FIRST_NAME),

  body('lastName')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_LAST_NAME),

  body('phone')
    .optional()
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_PHONE),

  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  body('contactPhone')
    .optional()
    .trim()
    .escape(),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage(MESSAGES.VALIDATION.INVALID_GENDER),

  body('languages')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_LANGUAGES),

  body('professionalExp')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_EXPERIENCE),

  body('certifications')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_CERTIFICATIONS),

  body('expStartDate')
    .optional()
    .isISO8601()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE),

  body('socialLinks')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_SOCIAL_LINKS),

  body('address')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_ADDRESS),
];
