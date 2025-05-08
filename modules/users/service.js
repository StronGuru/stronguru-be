const User = require('../../models/User');
const UserDevices = require('../../models/UserDevices');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');
const UserSettings = require('../../models/UserSettings');

exports.getAllUsers = async () => {
  const users = await User.find().select('-password');
  return users;
};

exports.getAllAmbassadors = async (roleFilter) => {
  const query = { ambassador: true };
  if (roleFilter) {
    query.role = roleFilter;
  }

  const ambassadors = await User.find(query).select('-password');
  return ambassadors;
};

exports.toggleAmbassador = async (userId, ambassadorStatus) => {
  if (typeof ambassadorStatus !== 'boolean') {
    throwError(MESSAGES.VALIDATION.INVALID_AMBASSADOR_VALUE, 400);
  }

  const user = await User.findById(userId);
  if (!user) {
    throwError(MESSAGES.GENERAL.USER_NOT_FOUND, 404);
  }

  user.ambassador = ambassadorStatus;
  await user.save();

  return { message: MESSAGES.SIGNUP.AMBASSADOR_STATUS_UPDATED(ambassadorStatus) };
};

exports.changePassword = async (userIdParam, userIdSession, oldPassword, newPassword) => {
  if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
    throwError(MESSAGES.VALIDATION.MISSING_PASSWORD, 400);
  }

  if (userIdParam !== userIdSession.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const user = await User.findById(userIdParam);
  if (!user) {
    throwError(MESSAGES.GENERAL.USER_NOT_FOUND, 404);
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throwError(MESSAGES.VALIDATION.PASSWORD_MISMATCH, 401);
  }

  user.password = newPassword;
  await user.save();

  await UserDevices.deleteMany({ user: userIdParam });

  return { message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS };
};

exports.getUserSettings = async (userId) => {
  const settings = await UserSettings.findOne({ user: userId });
  if (!settings) {
    throwError('Settings not found', 404);
  }
  return settings;
};

exports.updateUserSettings = async (userId, updateData) => {
  const allowedFields = ['darkmode', 'language', 'dateTimeFormat', 'timeZone'];
  const updates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throwError('No valid fields provided', 400);
  }

  const updated = await UserSettings.findOneAndUpdate(
    { user: userId },
    { $set: updates },
    { new: true }
  );

  if (!updated) {
    throwError('Settings not found', 404);
  }

  return updated;
};

