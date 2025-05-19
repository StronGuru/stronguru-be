const { body } = require('express-validator');
const MESSAGES = require('../../constants/messages');

// 📦 Import shared validators
const {
  validateFirstName,
  validateLastName,
  validatePhone,
  validateEmail,
  validateGender,
} = require('./shared/commonValidators');

// 👨‍⚕️ Professional profile update validator
exports.updateProfessionalValidator = [
  // Basic info
  validateFirstName().optional(),
  validateLastName().optional(),
  validatePhone().optional(),

  // Optional contact email (separate from login email)
  body('contactEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage(MESSAGES.VALIDATION.INVALID_EMAIL),

  // Optional contact phone
  body('contactPhone')
    .optional()
    .trim()
    .escape(),

  // Gender
  validateGender().optional(),

  // Professional experience details
  body('languages')
    .optional()
    .isArray()
    .withMessage(MESSAGES.VALIDATION.INVALID_LANGUAGES),


  // Optional social & address info
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_SOCIAL_LINKS),

  body('address')
    .optional()
    .isObject()
    .withMessage(MESSAGES.VALIDATION.INVALID_ADDRESS),

  // Qualifications validation
  body('qualifications').optional().isArray().withMessage(MESSAGES.VALIDATION.INVALID_QUALIFICATIONS),
  body('qualifications.*.degreeTitle').optional()
    .isString()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_DEGREE_TITLE),
  body('qualifications.*.institution').optional()
    .isString()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_INSTITUTION),
  body('qualifications.*.fieldOfStudy').optional()
    .isString()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_FIELD_OF_STUDY),
  body('qualifications.*.startDate').optional()
    .isISO8601()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE),
  body('qualifications.*.completionDate').optional()
    .isISO8601()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE),

  // Certifications validation
  body('certifications').optional().isArray().withMessage(MESSAGES.VALIDATION.INVALID_CERTIFICATIONS),
  body('certifications.*.certificationName').optional()
    .isString()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_CERTIFICATION_NAME),
  body('certifications.*.issuingOrganization').optional()
    .isString()
    .notEmpty()
    .withMessage(MESSAGES.VALIDATION.INVALID_ISSUING_ORGANIZATION),
  body('certifications.*.level').optional()
    .isString()
    .withMessage(MESSAGES.VALIDATION.INVALID_CERTIFICATION_LEVEL),
  body('certifications.*.certificationId').optional()
    .isString()
    .withMessage(MESSAGES.VALIDATION.INVALID_CERTIFICATION_ID),
  body('certifications.*.certificationUrl').optional()
    .isURL()
    .withMessage(MESSAGES.VALIDATION.INVALID_URL),
  body('certifications.*.issueDate').optional()
    .isISO8601()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE),
  body('certifications.*.expirationDate').optional()
    .isISO8601()
    .withMessage(MESSAGES.VALIDATION.INVALID_DATE),
];
