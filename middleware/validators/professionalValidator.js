const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// 📦 Import shared validators
const {
  validateFirstName,
  validateLastName,
  validatePhone,
  validateEmail,
  validateGender,
} = require('./shared/commonValidators');

// 👨‍⚕️ Professional profile update validator
exports.updateProfessionalValidator = [
  // Basic info
  validateFirstName().optional(),
  validateLastName().optional(),
  validatePhone().optional(),

  // Optional contact email (separate from login email)
  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  // Optional contact phone
  body('contactPhone')
    .optional()
    .trim()
    .escape(),

  // Gender
  validateGender().optional(),

  // Professional experience details
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

  // Optional social & address info
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_SOCIAL_LINKS),

  body('address')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_ADDRESS),
];
