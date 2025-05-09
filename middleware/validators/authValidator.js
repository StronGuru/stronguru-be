const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// 📦 Import shared validators
const {
  validateFirstName,
  validateLastName,
  validateEmail,
  validatePassword,
  validatePasswordNotEmpty,
  validateDateOfBirth,
  validateGender,
  validatePhone,
  validateTerms,
  validatePrivacy,
} = require('./shared/commonValidators');

// 🧾 Signup for regular users
exports.signupUserValidator = [
  validateFirstName(),
  validateLastName(),
  validateEmail(),
  validatePassword('password'),
  validateDateOfBirth(),
  validateGender(),
  validatePhone(),
  validateTerms(),
  validatePrivacy(),
];

// 👩‍⚕️ Signup for professionals (extends user signup)
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

// 🔐 Login
exports.loginValidator = [
  validateEmail(),
  validatePasswordNotEmpty('password'),
];

// 🔁 Forgot password
exports.forgotPasswordValidator = [
  validateEmail(),
];

// 🔄 Reset password
exports.resetPasswordValidator = [
  body('token')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.RESET_TOKEN_REQUIRED),

  validatePassword('newPassword'),
];
