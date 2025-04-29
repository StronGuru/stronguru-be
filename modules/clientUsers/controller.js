const ClientUserService = require('./service');

exports.getAllClientUsers = async (req, res, next) => {
  try {
    const clientUsers = await ClientUserService.getAllClientUsers();
    res.status(200).json(clientUsers);
  } catch (error) {
    next(error);
  }
};

exports.getClientUserProfile = async (req, res, next) => {
  try {
    const clientUser = await ClientUserService.getClientUserProfile(req.params.id, req.user);
    res.status(200).json(clientUser);
  } catch (error) {
    next(error);
  }
};

exports.updateClientUserProfile = async (req, res, next) => {
  try {
    const updatedClientUser = await ClientUserService.updateClientUserProfile(req.params.id, req.user, req.body);
    res.status(200).json({ message: 'Profile updated successfully', clientUserId: updatedClientUser._id });
  } catch (error) {
    next(error);
  }
};

exports.deleteClientUserAccount = async (req, res, next) => {
  try {
    const message = await ClientUserService.deleteClientUserAccount(req.params.id, req.user, req.body.password);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};
