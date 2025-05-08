const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

exports.changePasswordValidator = [
  body('oldPassword')
    .trim()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.MISSING_OLD_PASSWORD),

  body('newPassword')
    .trim()
    .isLength({ min: 8 })
    .withMessage(MESSAGES.VALIDATION.WEAK_PASSWORD),
];
