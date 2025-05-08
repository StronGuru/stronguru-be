const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

exports.updateClientUserValidator = [
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

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage(MESSAGES.VALIDATION.INVALID_GENDER),

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

  body('socialLinks')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_SOCIAL_LINKS),

  body('address')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_ADDRESS),
];
