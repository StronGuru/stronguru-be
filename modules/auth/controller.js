const AuthService = require('./service');

exports.signupProfessional = (req, res) => {
    AuthService.signupProfessional(req, res);
};

exports.signupUser = (req, res) => {
    AuthService.signupUser(req, res);
};

exports.login = (req, res) => {
    AuthService.login(req, res);
};

exports.refreshToken = (req, res) => {
    AuthService.refreshToken(req, res);
};

exports.logout = (req, res) => {
    AuthService.logout(req, res);
};