const UserToken = require('../../models/UserToken');
const User = require('../../models/User');
const throwError = require('../../helpers/throwError');
const MESSAGES = require('../../constants/messages');

exports.activateAccount = async (activationToken) => {
  const tokenDoc = await UserToken.findOne({ token: activationToken, type: 'activation' });
  if (!tokenDoc) {
    throwError(MESSAGES.AUTH.INVALID_ACTIVATION_TOKEN, 400);
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throwError(MESSAGES.GENERAL.USER_NOT_FOUND, 404);
  }

  if (user.isVerified) {
    throwError(MESSAGES.AUTH.ALREADY_VERIFIED, 400);
  }

  user.isVerified = true;
  await user.save();

  await UserToken.deleteOne({ _id: tokenDoc._id });

  return MESSAGES.AUTH.ACCOUNT_ACTIVATED;
};
