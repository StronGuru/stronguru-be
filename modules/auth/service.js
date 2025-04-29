const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const Professional = require('../../models/discriminators/Professional');
const ClientUser = require('../../models/discriminators/ClientUser');
const UserDevices = require('../../models/UserDevices');
const UserToken = require('../../models/UserToken');
const UserSettings = require('../../models/UserSettings');
const MESSAGES = require('../../constants/messages');
const sendTemplateEmail = require('../../config/emailService');
const { generateAccessToken, generateRefreshToken } = require('../../helpers/tokenUtils');
const { USER_ROLES } = require('../../constants/userRoles');
const { filterValidSpecializations, assignSpecToProfessional } = require('../../helpers/SpecValidation');

// POST /signup/professional
exports.signupProfessional = async (req, res) => {
    let professional = null;

    try {
        const { firstName, lastName, email, password, dateOfBirth, gender, phone, specializations, taxCode, pIva, contactEmail, contactPhone, address, acceptedTerms, acceptedPrivacy } = req.body;

        // Validate terms acceptance
        if (!acceptedTerms || !acceptedPrivacy) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.MISSING_TERMS });
        }

        // Validate specializations
        const validSpecializations = filterValidSpecializations(specializations);
        if (validSpecializations.length === 0) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.INVALID_SPECIALIZATION });
        }
        

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.EMAIL_IN_USE });
        }        

        // Create new Professional instance
        professional = new Professional({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
            gender,
            phone,
            role: USER_ROLES.PROFESSIONAL,
            specializations: validSpecializations,
            taxCode,
            pIva,
            contactEmail,
            contactPhone,
            address,
            acceptedTerms,
            acceptedPrivacy
        });

        await professional.save();

        
        if (professional.role !== USER_ROLES.PROFESSIONAL) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role });
        }

        // Create default user settings
        await new UserSettings({
            user: professional._id
        }).save();

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

        res.status(201).json({
            message: MESSAGES.SIGNUP.SUCCESS_PROFESSIONAL,
            userId: professional._id,
            activationKey: activationToken
        });

    } catch (err) {
        console.error('Signup error:', err);

        // Rollback professional and token if creation failed
        if (professional) {
            await Professional.deleteOne({ _id: professional._id });
            await UserToken.deleteOne({ userId: professional._id });
        }

        res.status(400).json({
            message: MESSAGES.GENERAL.SERVER_ERROR,
            error: err.message
        });
    }
};

// POST /signup/user
exports.signupUser = async (req, res) => {
    let clientUser = null;

    try {
        const { firstName, lastName, email, password, dateOfBirth, gender, phone, acceptedTerms, acceptedPrivacy } = req.body;

        // Validate terms acceptance
        if (!acceptedTerms || !acceptedPrivacy) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.MISSING_TERMS });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.EMAIL_IN_USE });
        }        

        // Create new ClientUser instance
        clientUser = new ClientUser({
            firstName,
            lastName,
            email,
            password,
            dateOfBirth,
            gender,
            phone,
            acceptedTerms,
            acceptedPrivacy
        });

        await clientUser.save();

        if (clientUser.role !== USER_ROLES.USER) {
            return res.status(400).json({ message: MESSAGES.SIGNUP.WRONG_ROLE + ': ' + role });
        }

        // Create default user settings
        await new UserSettings({
            user: clientUser._id
        }).save();

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

        res.status(201).json({
            message: MESSAGES.SIGNUP.SUCCESS_USER,
            userId: clientUser._id,
            activationKey: activationToken
        });
    } catch (err) {
        console.error('Signup error:', err);

        // Rollback user and token if creation failed
        if (clientUser) {
            await ClientUser.deleteOne({ _id: clientUser._id }); // Rimuove il ClientUser creato
            await UserToken.deleteOne({ userId: clientUser._id });
        }
        

        res.status(400).json({
            message: MESSAGES.GENERAL.SERVER_ERROR,
            error: err.message
        });
    }
};

// POST /auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const deviceType = req.useragent.isMobile || req.useragent.isTablet ? 'mobile' : 'desktop';

         // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: MESSAGES.AUTH.MISSING_CREDENTIALS });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });

         // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });

        // Check device type against role
        if (deviceType === 'mobile' && user.role !== USER_ROLES.USER) {
            return res.status(403).json({ message: MESSAGES.AUTH.ROLE_NOT_ALLOWED_MOBILE + ': ' + user.role });
        }

        if (deviceType === 'desktop' && ![USER_ROLES.PROFESSIONAL, USER_ROLES.ADMIN].includes(user.role)) {
            return res.status(403).json({ message: MESSAGES.AUTH.ROLE_NOT_ALLOWED_DESKTOP + ': ' + user.role });
        }

        // Check if email is verified
        if (!user.isVerified) {
            return res.status(401).json({
                message: MESSAGES.AUTH.EMAIL_NOT_VERIFIED + ': ' + user.email
            });
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
            const userDevice = new UserDevices({
                user: user._id,
                ipAddress: req.ip,
                userAgent: req.useragent.source,
                refreshToken: refreshToken,
                deviceType: deviceType
            });
            await userDevice.save();
            existingDevice = userDevice;
        }

        // Set cookies
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true, // solo in HTTPS in prod
            secure: process.env.NODE_ENV === 'production', // true solo in prod (HTTPS)
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 giorni
        });

        res.cookie('deviceId', existingDevice._id.toString(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });

        // Respond with accessToken and user info
        res.status(200).json({
            accessToken,
            deviceId: existingDevice._id,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err)
        res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR + ' ' + err });
    }
};

// POST /auth/refresh-token
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const deviceId = req.cookies.deviceId;

        // Check if both tokens are present
        if (!refreshToken || !deviceId) {
            return res.status(400).json({ message: MESSAGES.AUTH.TOKEN_MISSING });
        }

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find the corresponding device
        const device = await UserDevices.findOne({ _id: deviceId, user: decoded.id, refreshToken });
        if (!device) return res.status(403).json({ message: MESSAGES.AUTH.DEVICE_INVALID });

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

        // Update cookies
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: true, // solo in HTTPS in prod
            secure: process.env.NODE_ENV === 'production', // true solo in prod (HTTPS)
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 giorni
        });

        res.cookie('deviceId', device._id.toString(), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        // Return new access token
        return res.json({ accessToken: newAccessToken });

    } catch (err) {
        console.error('Refresh token error:', err);
        return res.status(403).json({ message: MESSAGES.TOKEN.INVALID_OR_EXPIRED + ' ' + err });
    }
};

exports.logout = async (req, res) => {
    try {
    const refreshToken = req.cookies.refreshToken;

    // If no refresh token is present, simply clear cookies
    if (!refreshToken) {
        res.clearCookie('refreshToken');
        res.clearCookie('deviceId');
        return res.status(200).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
      }
    
    // Find and delete the device associated with the refresh token
    await UserDevices.findOneAndDelete({ refreshToken });

    // Clear cookies
    res.clearCookie('refreshToken');
    res.clearCookie('deviceId');

    return res.status(200).json({ message: MESSAGES.AUTH.LOGOUT_SUCCESS });
    } catch (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: MESSAGES.GENERAL.SERVER_ERROR });
    }
};
