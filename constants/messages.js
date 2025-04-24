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
      EMAIL_IN_USE: 'An account with this email already exists.',
      MISSING_TERMS: 'You must accept the terms and privacy policy.',
      INVALID_SPECIALIZATION: 'No valid specialization was provided.',
      WRONG_ROLE: 'Invalid role specified for this signup type.',
      SUCCESS_USER: 'User account created successfully. Please check your email to activate it.',
      SUCCESS_PROFESSIONAL: 'Professional account created successfully. Please verify via email.',
      AMBASSADOR_STATUS_UPDATED: (value) => `Ambassador status has been updated to ${value ? 'active' : 'inactive'}.`
    },
  
    VALIDATION: {
      REQUIRED_FIELDS: 'Some required fields are missing or invalid.',
      PASSWORD_MISMATCH: 'Incorrect current password.',
      MISSING_PASSWORD: 'Password is required.',
      NO_VALID_FIELDS: 'No valid fields provided for update.',
      INVALID_PAYLOAD: 'Invalid or incomplete request payload.',
      INVALID_AMBASSADOR_VALUE: 'Invalid ambassador value. Must be true or false.'
    },
  
    TOKEN: {
      INVALID_OR_EXPIRED: 'The provided token is invalid or has expired.',
      ACTIVATION_SUCCESS: 'Your account has been successfully activated.',
    },
  
    GENERAL: {
      SERVER_ERROR: 'An internal server error occurred.',
      USER_NOT_FOUND: 'User not found.',
      PROFESSIONAL_NOT_FOUND: 'Professional not found.',
      DEVICE_NOT_FOUND: 'Device not found.',
      UNAUTHORIZED_ACCESS: 'You are not authorized to perform this action.',
      ACCOUNT_DELETED: 'Account deleted successfully.',
      ACTION_FORBIDDEN: 'You do not have permission to perform this operation.',
    }
  };
  
  module.exports = MESSAGES;
  