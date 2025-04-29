const UserDevices = require('../../models/UserDevices');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');

exports.getUserDevices = async (userId) => {
  const devices = await UserDevices.find({ user: userId }).select('-refreshToken');
  return devices;
};

exports.getUserDeviceById = async (userId, deviceId) => {
  const device = await UserDevices.findOne({ _id: deviceId, user: userId }).select('-refreshToken');

  if (!device) {
    throwError(MESSAGES.DEVICES.DEVICE_NOT_FOUND, 404);
  }

  return device;
};


exports.deleteUserDevice = async (userId, deviceId) => {
  const device = await UserDevices.findOne({ _id: deviceId, user: userId });

  if (!device) {
    throwError(MESSAGES.DEVICES.DEVICE_NOT_FOUND, 404);
  }

  await UserDevices.deleteOne({ _id: deviceId });

  return MESSAGES.DEVICES.DEVICE_REVOKED;
};
