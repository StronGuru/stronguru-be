const AuthService = require('./service');

exports.signupProfessional = async (req, res, next) => {
  try {
    const result = await AuthService.signupProfessional(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.signupUser = async (req, res, next) => {
  try {
    const result = await AuthService.signupUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body, req);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.cookie('deviceId', result.deviceId.toString(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(200).json({
      accessToken: result.accessToken,
      deviceId: result.deviceId,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const result = await AuthService.refreshToken(req.cookies);

    res.cookie('refreshToken', req.cookies.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const message = await AuthService.logout(req.cookies);

    res.clearCookie('refreshToken');
    res.clearCookie('deviceId');

    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};
