const ClientUser = require('../../models/discriminators/ClientUser');
const UserDevices = require('../../models/UserDevices');
const UserSettings = require('../../models/UserSettings');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');
const bcrypt = require('bcryptjs');

exports.getAllClientUsers = async () => {
  const clientUsers = await ClientUser.find().select('-password');
  return clientUsers;
};

exports.getClientUserProfile = async (clientUserId, user) => {
  if (user.role !== 'admin' && clientUserId !== user._id.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const clientUser = await ClientUser.findById(clientUserId).select('-password');
  if (!clientUser) {
    throwError(MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND, 404);
  }

  return clientUser;
};

exports.updateClientUserProfile = async (clientUserId, user, updateData) => {
  if (clientUserId !== user._id.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

 // Campi che non possono essere aggiornati
 const excludedFields = [
  'password', 'email', 'role', 'isVerified', 'createdAt', 'updatedAt', 'ambassador', 'acceptedPrivacy', 'acceptedTerms'
];

  const sanitizedBody = {};

  // Aggiungi tutti i campi tranne quelli esclusi
  Object.keys(updateData).forEach(field => {
    if (!excludedFields.includes(field)) {
      sanitizedBody[field] = updateData[field];
    }
  });

  if (Object.keys(sanitizedBody).length === 0) {
    throwError(MESSAGES.VALIDATION.NO_VALID_FIELDS, 400);
  }

  const updatedClientUser = await ClientUser.findByIdAndUpdate(
    clientUserId,
    { $set: sanitizedBody },
    { new: true }
  ).select('-password');

  if (!updatedClientUser) {
    throwError(MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND, 404);
  }

  return updatedClientUser;
};

exports.deleteClientUserAccount = async (clientUserId, user, providedPassword) => {
  if (clientUserId !== user._id.toString()) {
    throwError(MESSAGES.GENERAL.UNAUTHORIZED_ACCESS, 403);
  }

  const clientUser = await ClientUser.findById(clientUserId);
  if (!clientUser) {
    throwError(MESSAGES.GENERAL.CLIENTUSER_NOT_FOUND, 404);
  }

  const isMatch = await bcrypt.compare(providedPassword, clientUser.password);
  if (!isMatch) {
    throwError(MESSAGES.VALIDATION.PASSWORD_MISMATCH, 401);
  }

  await UserDevices.deleteMany({ user: clientUserId });
  await UserSettings.deleteMany({ user: clientUserId });
  await ClientUser.findByIdAndDelete(clientUserId);

  return MESSAGES.GENERAL.ACCOUNT_DELETED;
};
