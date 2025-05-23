const express = require('express');
const router = express.Router();
const AuthController = require('./controller');
const { forgotPasswordLimiter } = require('../../middleware/rateLimit');

router.post('/signup/professional', AuthController.signupProfessional);
router.post('/signup/user', AuthController.signupUser);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password',forgotPasswordLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;