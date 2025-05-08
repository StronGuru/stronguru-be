const MESSAGES = {
    AUTH: {
      // Errors
      MISSING_CREDENTIALS: 'Email and password are required.',
      INVALID_CREDENTIALS: 'Invalid email or password.',
      EMAIL_NOT_VERIFIED: 'Please verify your email before logging in.',
      ROLE_NOT_ALLOWED_MOBILE: 'Only users can log in from mobile devices.',
      ROLE_NOT_ALLOWED_DESKTOP: 'Only professionals or admins can access via desktop.',
      TOKEN_MISSING: 'Access token is missing or invalid.',
      DEVICE_INVALID: 'This device is no longer authorized.',
      REFRESH_INVALID: 'Invalid or expired refresh token.',
  
      // Success
      LOGOUT_SUCCESS: 'You have been successfully logged out.',
      LOGIN_SUCCESS: 'Login successful.',
      TOKEN_REFRESHED: 'Access token refreshed successfully.',
      PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
      PASSWORD_RESET_EMAIL: 'Password reset email sent.'
    },
  
    SIGNUP: {
      MISSING_TERMS: 'You must accept the terms and privacy policy.',
      MISSING_PRIVACY: 'You must accept the privacy policy',
      INVALID_SPECIALIZATION: 'No valid specialization was provided.',
      EMAIL_IN_USE: 'An account with this email already exists.',
      SUCCESS_USER: 'User account created successfully. Please check your email to activate it.',
      SUCCESS_PROFESSIONAL: 'Professional account created successfully. Please verify via email.',
      WRONG_ROLE: 'Invalid role specified for this signup type.',
      AMBASSADOR_STATUS_UPDATED: (value) => `Ambassador status has been updated to ${value ? 'active' : 'inactive'}.`
    },
  
    VALIDATION: {
      REQUIRED_FIRST_NAME: 'First name is required',
      REQUIRED_LAST_NAME: 'Last name is required',
      INVALID_EMAIL: 'Invalid email format',
      WEAK_PASSWORD: 'Password must be at least 8 characters long',
      REQUIRED_DOB: 'Date of birth is required',
      REQUIRED_PHONE: 'Phone number is required',
      INVALID_GENDER: 'Gender must be one of: male, female, or other',
      MISSING_PASSWORD: 'Password is required.',
      PASSWORD_MISMATCH: 'Incorrect current password.',
      PASSWORD_REUSE_NOT_ALLOWED: 'New password must be different from the previous one.',
      NO_VALID_FIELDS: 'No valid fields provided for update.',
      INVALID_AMBASSADOR_VALUE: 'Invalid ambassador value. Must be true or false.',
      VAT_INVALID_LENGTH: 'VAT number must be between 11 and 13 characters',
      TAXCODE_INVALID_LENGTH: 'Tax code must be at least 11 characters',
      RESET_TOKEN_REQUIRED: 'Reset token is required',
      INVALID_LANGUAGE: 'Invalid language option',
      INVALID_DARKMODE: 'Darkmode must be a boolean value',
      INVALID_DATETIME_FORMAT: 'Time format must be either 12h or 24h',
      INVALID_TIMEZONE: 'Timezone must be a non-empty string',
      MISSING_OLD_PASSWORD: 'Current password is required',
      INVALID_FITNESS_LEVEL: 'Fitness level must be beginner, intermediate or advanced',
      INVALID_ACTIVITY_LEVEL: 'Activity level must be sedentary, lightly_active, moderately_active or very_active',
      INVALID_GOALS: 'Goals must be an array',
      INVALID_PREFERENCES: 'Preferences must be an array',
      INVALID_CURRENT_SPORTS: 'Current sports must be an array',
      INVALID_COMPETITIVE_LEVEL: 'Competitive level must be beginner, intermediate or advanced',
      INVALID_SOCIAL_LINKS: 'Social links must be an object',
      INVALID_ADDRESS: 'Address must be an object',
      INVALID_LANGUAGES: 'Languages must be an array',
      INVALID_EXPERIENCE: 'Professional experience must be an array',
      INVALID_CERTIFICATIONS: 'Certifications must be an array',
      INVALID_DATE: 'Experience start date must be a valid ISO date',
    },
  
    TOKEN: {
      INVALID_OR_EXPIRED: 'The provided token is invalid or has expired.',
      ACTIVATION_SUCCESS: 'Your account has been successfully activated.',
    },
  
    GENERAL: {
      SERVER_ERROR: 'An internal server error occurred.',
      USER_NOT_FOUND: 'User not found.',
      PROFESSIONAL_NOT_FOUND: 'Professional not found.',
      CLIENTUSER_NOT_FOUND: 'ClientUser not found.',
      DEVICE_NOT_FOUND: 'Device not found.',
      UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action.',
      ACCOUNT_DELETED: 'Account deleted successfully.',
      ACTION_FORBIDDEN: 'You do not have permission to perform this operation.',
      DEVICE_TYPE_NOT_VALID: 'Device Type not valid.'
    },

    USER_SETTINGS: {
      NOT_FOUND: 'User settings not found',
      UPDATED: 'Settings updated successfully',
      INVALID_FIELDS: 'No valid fields provided for update',
    }
    
  };
  
  module.exports = MESSAGES;
  