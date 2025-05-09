const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// 📦 Import shared validators
const {
  validateFirstName,
  validateLastName,
  validatePhone,
  validateGender,
} = require('./shared/commonValidators');

// 👤 ClientUser profile update validator
exports.updateClientUserValidator = [
  // Basic info
  validateFirstName().optional(),
  validateLastName().optional(),
  validatePhone().optional(),
  validateGender().optional(),

  // Fitness profile fields
  body('fitnessLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage(MESSAGES.VALIDATION.INVALID_FITNESS_LEVEL),

  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active'])
    .withMessage(MESSAGES.VALIDATION.INVALID_ACTIVITY_LEVEL),

  body('goals')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_GOALS),

  body('preferences')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_PREFERENCES),

  body('currentSports')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_CURRENT_SPORTS),

  body('competitiveLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage(MESSAGES.VALIDATION.INVALID_COMPETITIVE_LEVEL),

  // Contact & social info
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_SOCIAL_LINKS),

  body('address')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_ADDRESS),
];
