const express = require('express');
const router = express.Router();
const AuthController = require('./controller');
const { forgotPasswordLimiter } = require('../../middleware/rateLimit');
const validate = require('../../middleware/validators/validationErrorHandler');
const {
    signupUserValidator,
    signupProfessionalValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
  } = require('../../middleware/validators/authValidator');

router.post('/signup/professional', signupProfessionalValidator, validate, AuthController.signupProfessional);
router.post('/signup/user',signupUserValidator, validate, AuthController.signupUser);
router.post('/login',loginValidator, validate, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, validate, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, AuthController.resetPassword);

module.exports = router;