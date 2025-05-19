const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// 📦 Import shared password validator
const {
  validatePassword,
} = require('./shared/commonValidators');

// 🔒 Password change validator
exports.changePasswordValidator = [
  // Old password must be provided
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.MISSING_OLD_PASSWORD),

  // New password must be strong (same rules as signup/reset)
  validatePassword('newPassword'),
];
