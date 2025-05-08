const UserService = require('./service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

exports.getAllAmbassadors = async (req, res, next) => {
  try {
    const ambassadors = await UserService.getAllAmbassadors(req.query.role);
    res.status(200).json(ambassadors);
  } catch (error) {
    next(error);
  }
};

exports.toggleAmbassador = async (req, res, next) => {
  try {
    const result = await UserService.toggleAmbassador(req.params.id, req.body.ambassador);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const result = await UserService.changePassword(req.params.id, req.user._id, req.body.oldPassword, req.body.newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getOwnSettings = async (req, res, next) => {
  try {
    const settings = await UserService.getUserSettings(req.user._id);
    res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

exports.updateOwnSettings = async (req, res, next) => {
  try {
    const updated = await UserService.updateUserSettings(req.user._id, req.body);
    res.status(200).json({  message: MESSAGES.USER_SETTINGS.UPDATED, settings: updated });
  } catch (error) {
    next(error);
  }
};

