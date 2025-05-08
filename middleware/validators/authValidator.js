const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

exports.signupUserValidator = [
  body('firstName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_FIRST_NAME),

  body('lastName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_LAST_NAME),

  body('email')
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage(MESSAGES.VALIDATION.WEAK_PASSWORD),

  body('dateOfBirth')
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_DOB),

  body('gender')
    .trim()
    .isIn(['male', 'female', 'other'])
    .withMessage(MESSAGES.VALIDATION.INVALID_GENDER),

  body('phone')
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_PHONE),

  body('acceptedTerms')
    .equals('true')
    .withMessage(MESSAGES.SIGNUP.MISSING_TERMS),

  body('acceptedPrivacy')
    .equals('true')
    .withMessage(MESSAGES.SIGNUP.MISSING_PRIVACY),
];

exports.signupProfessionalValidator = [
  ...exports.signupUserValidator,

  body('specializations')
    .isArray({ min: 1 })
    .withMessage(MESSAGES.SIGNUP.INVALID_SPECIALIZATION),

  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  body('pIva')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 11, max: 13 })
    .withMessage(MESSAGES.VALIDATION.VAT_INVALID_LENGTH),

  body('taxCode')
    .optional()
    .trim()
    .escape()
    .isLength({ min: 11 })
    .withMessage(MESSAGES.VALIDATION.TAXCODE_INVALID_LENGTH),
];

exports.loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  body('password')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.MISSING_PASSWORD),
];

exports.forgotPasswordValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),
];

exports.resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.RESET_TOKEN_REQUIRED),

  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage(MESSAGES.VALIDATION.WEAK_PASSWORD),
];
