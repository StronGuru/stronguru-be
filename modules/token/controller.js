const TokenService = require('./service');

exports.activateAccount = async (req, res, next) => {
  try {
    const result = await TokenService.activateAccount(req.params.token);
    res.status(200).json({ message: result });
  } catch (error) {
    next(error);
  }
};
