const { body } = require('express-validator');
const MESSAGES = require('../../../constants/messages');

// 🔤 First & Last Name
exports.validateFirstName = () =>
  body('firstName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_FIRST_NAME);

exports.validateLastName = () =>
  body('lastName')
    .trim()
    .escape()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.REQUIRED_LAST_NAME);

// 📧 Email
exports.validateEmail = () =>
  body('email')
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL);

// 🔐 Passwords
// Use for signup, reset, or change (enforces complexity)
exports.validatePassword = (field = 'password') =>
  body(field)
    .trim()
    .isLength({ min: 8 })
    .withMessage(MESSAGES.VALIDATION.WEAK_PASSWORD)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .withMessage(MESSAGES.VALIDATION.PASSWORD_COMPLEXITY);

// Use for login, deletion – only checks presence
exports.validatePasswordNotEmpty = (field = 'password') =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.MISSING_PASSWORD);

// 📱 Phone number - ora opzionale
exports.validatePhone = () =>
  body('phone')
    .optional()
    .trim()
    .escape();

// ⚧️ Gender - ora opzionale
exports.validateGender = () =>
  body('gender')
    .optional()
    .trim()
    .isIn(['male', 'female', 'other'])
    .withMessage(MESSAGES.VALIDATION.INVALID_GENDER);

// 📆 Date of birth - ora opzionale
exports.validateDateOfBirth = () =>
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE);

// ✅ Terms & Privacy agreement
exports.validateTerms = () =>
  body('acceptedTerms')
    .equals('true')
    .withMessage(MESSAGES.SIGNUP.MISSING_TERMS);

exports.validatePrivacy = () =>
  body('acceptedPrivacy')
    .equals('true')
    .withMessage(MESSAGES.SIGNUP.MISSING_PRIVACY);
