const UserDeviceService = require('./service');

exports.getUserDevices = async (req, res, next) => {
  try {
    const devices = await UserDeviceService.getUserDevices(req.user._id);
    res.status(200).json(devices);
  } catch (error) {
    next(error);
  }
};

exports.getUserDeviceById = async (req, res, next) => {
  try {
    const device = await UserDeviceService.getUserDeviceById(req.user._id, req.params.deviceId);
    res.status(200).json(device);
  } catch (error) {
    next(error);
  }
};


exports.deleteUserDevice = async (req, res, next) => {
  try {
    const message = await UserDeviceService.deleteUserDevice(req.user._id, req.params.deviceId);
    res.status(200).json({ message });
  } catch (error) {
    next(error);
  }
};
