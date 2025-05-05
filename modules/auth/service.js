const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Professional = require('../../models/discriminators/Professional');
const ClientUser = require('../../models/discriminators/ClientUser');
const UserDevices = require('../../models/UserDevices');
const UserToken = require('../../models/UserToken');
const UserSettings = require('../../models/UserSettings');
const MESSAGES = require('../../constants/messages');
const TOKEN_TYPES = require('../../constants/tokenTypes');
const sendTemplateEmail = require('../../config/emailService');
const { generateAccessToken, generateRefreshToken } = require('../../helpers/tokenUtils');
const { USER_ROLES } = require('../../constants/userRoles');
const { filterValidSpecializations, assignSpecToProfessional } = require('../../helpers/SpecValidation');
const throwError = require('../../helpers/throwError');

// POST /signup/professional
exports.signupProfessional = async (data) => {
    let professional = null;

    
    const { firstName, lastName, email, password, dateOfBirth, gender, phone, specializations, taxCode, pIva, contactEmail, contactPhone, address, acceptedTerms, acceptedPrivacy } = data;

    // Validate terms acceptance
    if (!acceptedTerms || !acceptedPrivacy) {
        throwError(MESSAGES.SIGNUP.MISSING_TERMS, 400);
    }

    // Validate specializations
    const validSpecializations = filterValidSpecializations(specializations);
    if (validSpecializations.length === 0) {
        throwError(MESSAGES.SIGNUP.INVALID_SPECIALIZATION, 400);
    }
        

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throwError(MESSAGES.SIGNUP.EMAIL_IN_USE, 400);
    }

    try {
        // Create new Professional instance
        professional = new Professional({
            ...data,
            specializations: validSpecializations,
            role: USER_ROLES.PROFESSIONAL
        });

        await professional.save();

        
        if (professional.role !== USER_ROLES.PROFESSIONAL) {
            throwError(MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role, 400);
        }

        // Create default user settings
        await new UserSettings({ user: professional._id }).save();

        // Assign specialization models
        await assignSpecToProfessional(validSpecializations, professional._id);

        // Generate activation token
        const activationToken = crypto.randomBytes(32).toString('hex');

        // Save activation token to database
        await new UserToken({
            userId: professional._id,
            token: activationToken,
            type: 'activation'
        }).save();

        // Send activation email
        await sendTemplateEmail({
            to: professional.email,
            templateKey: 'REGISTRATION',
            dynamicData: {
                activationToken: activationToken
            }
        });

        console.log(`Activation email sent to: ${professional.email} (Token: ${activationToken.slice(0, 5)}...)`);

        return{
            message: MESSAGES.SIGNUP.SUCCESS_PROFESSIONAL,
            userId: professional._id,
            activationKey: activationToken
        };

    } catch (err) {
        // Rollback professional and token if creation failed
        if (professional) {
            await Professional.deleteOne({ _id: professional._id });
            await UserToken.deleteOne({ userId: professional._id });
        }

        throw err;
    }
};

// POST /signup/user
exports.signupUser = async (data) => {
    let clientUser = null;

    const { firstName, lastName, email, password, dateOfBirth, gender, phone, acceptedTerms, acceptedPrivacy } = data;

    // Validate terms acceptance
    if (!acceptedTerms || !acceptedPrivacy) {
        throwError(MESSAGES.SIGNUP.MISSING_TERMS, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throwError(MESSAGES.SIGNUP.EMAIL_IN_USE, 400);
    }

    try {
        // Create new ClientUser instance
        clientUser = new ClientUser({
            ...data,
            role: USER_ROLES.USER
        });

        await clientUser.save();

        if (clientUser.role !== USER_ROLES.USER) {
            throwError(MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role, 400);
        }

        // Create default user settings
        await new UserSettings({ user: clientUser._id }).save();

        // Generate activation token
        const activationToken = crypto.randomBytes(32).toString('hex');

        // Save activation token to database
        await new UserToken({
            userId: clientUser._id,
            token: activationToken,
            type: 'activation'
        }).save();

        // Send activation email
        await sendTemplateEmail({
            to: clientUser.email,
            templateKey: 'REGISTRATION',
            dynamicData: {
                activationToken: activationToken
            }
        });

        console.log(`Activation email sent to: ${clientUser.email} (Token: ${activationToken.slice(0, 5)}...)`);

        return {
            message: MESSAGES.SIGNUP.SUCCESS_USER,
            userId: clientUser._id,
            activationKey: activationToken
        };

    } catch (err) {
        // Rollback user and token if creation failed
        if (clientUser) {
            await ClientUser.deleteOne({ _id: clientUser._id }); // Rimuove il ClientUser creato
            await UserToken.deleteOne({ userId: clientUser._id });
        }
        throw err;
    }
};

// POST /auth/login
exports.login = async (data, req) => {
    const { email, password } = data;
    const deviceType = req.useragent.isMobile || req.useragent.isTablet ? 'mobile' : 'desktop';

    // Basic validation
    if (!email || !password) {
        throwError(MESSAGES.AUTH.MISSING_CREDENTIALS, 400);
    }

    // Find user by email and verify password
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        throwError(MESSAGES.AUTH.INVALID_CREDENTIALS, 400);
    }

    // Check device type against role
    if (deviceType === 'mobile' && user.role !== USER_ROLES.USER) {
        throwError(`${MESSAGES.AUTH.ROLE_NOT_ALLOWED_MOBILE}: ${user.role}`, 403);
    }

    if (deviceType === 'desktop' && ![USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN].includes(user.role)) {
        throwError(`${MESSAGES.AUTH.ROLE_NOT_ALLOWED_DESKTOP}: ${user.role}`, 403);
    }

    // Check if email is verified
    if (!user.isVerified) {
        throwError(`${MESSAGES.AUTH.EMAIL_NOT_VERIFIED}: ${user.email}`, 401);
    }

    // Create JWT tokens
    const payload = { id: user.id, role: user.role, deviceType: deviceType };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Find existing device by deviceId cookie
    let existingDevice;
    const deviceId = req.cookies.deviceId;
    if (deviceId) {
        existingDevice = await UserDevices.findOne({ _id: deviceId, user: user._id });
    }

    // Update or create user device
    if (existingDevice) {
        existingDevice.refreshToken = refreshToken;
        existingDevice.ipAddress = req.ip;
        existingDevice.userAgent = req.useragent.source;
        existingDevice.deviceType = deviceType;
        existingDevice.lastAccessed = new Date();
        await existingDevice.save();
    } else {
        // create new device, if doesn't exists
        existingDevice = await new UserDevices({
            user: user._id,
            ipAddress: req.ip,
            userAgent: req.useragent.source,
            refreshToken: refreshToken,
            deviceType
        }).save();
    }

    // Respond with accessToken and user info
    return {
        accessToken,
        refreshToken,
        deviceId: existingDevice._id,
        user: {
            id: user._id,
            email: user.email,
            role: user.role
        }
    };
};

// POST /auth/refresh-token
exports.refreshToken = async (cookies) => {
    const {refreshToken, deviceId} = cookies;

    // Check if both tokens are present
    if (!refreshToken || !deviceId) {
        throwError(MESSAGES.AUTH.TOKEN_MISSING, 400);
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the corresponding device
    const device = await UserDevices.findOne({ _id: deviceId, user: decoded.id, refreshToken });
    if (!device) {
        throwError(MESSAGES.AUTH.DEVICE_INVALID, 403);
    }

    // Generate new tokens
    const payload = {
        id: decoded.id,
        role: decoded.role,
        deviceType: decoded.deviceType
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update device with new refresh token and last access timestamp
    device.refreshToken = newRefreshToken;
    device.lastAccessed = new Date();
    await device.save();

    // Return new access token
    return { accessToken: newAccessToken };
};

exports.logout = async (cookies) => {
    const {refreshToken} = cookies;

    // Find and delete the device associated with the refresh token
    if (refreshToken) {
        await UserDevices.findOneAndDelete({ refreshToken });
      }

    return MESSAGES.AUTH.LOGOUT_SUCCESS;
};

exports.requestPasswordReset = async (email) => {
    const user = await User.findOne({ email });
  
    // Per evitare user enumeration: restituiamo messaggio generico anche se utente non trovato o non verificato
    if (!user || !user.isVerified) {
      return { message: MESSAGES.AUTH.PASSWORD_RESET_EMAIL };
    }
  
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await new UserToken({
    userId: user._id,
    token: hashedToken,
    type: TOKEN_TYPES.PASSWORD_RESET
    }).save();

  
    await sendTemplateEmail({
      to: user.email,
      templateKey: 'PASSWORD_RESET',
      dynamicData: {
        resetToken: rawToken
      }
    });

    console.info(`[RESET] Password reset token sent to ${user.email} at ${new Date().toISOString()}`);
    
    console.log(`[TEST] Raw reset token: ${rawToken}`); //da eliminare
    return { message: MESSAGES.AUTH.PASSWORD_RESET_EMAIL };
  };

  exports.resetPasswordByToken = async (token, newPassword) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const tokenDoc = await UserToken.findOne({ token: hashedToken, type: TOKEN_TYPES.PASSWORD_RESET });

  
    if (!tokenDoc) {
      throwError(MESSAGES.TOKEN.INVALID_OR_EXPIRED, 400);
    }
  
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throwError(MESSAGES.GENERAL.USER_NOT_FOUND, 404);
    }

    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
    throwError(MESSAGES.VALIDATION.PASSWORD_REUSE_NOT_ALLOWED || 'New password must be different from the previous one', 400);
    }
  
    user.password = newPassword;
    await user.save();

    console.info(`[RESET] Password changed for user ${user.email} at ${new Date().toISOString()}`);
  
    await tokenDoc.deleteOne();
  
    return { message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS };
  };
  