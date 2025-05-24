const { body, param } = require('express-validator');

exports.createSlotValidator = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('startTime').isISO8601().withMessage('Start time must be a valid ISO date'),
    body('endTime').isISO8601().withMessage('End time must be a valid ISO date'),
    body('maxParticipants')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Max participants must be between 1 and 100'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    body('description').optional().trim(),
    
    // Recurring appointment validation
    body('isRecurring')
        .optional()
        .isBoolean()
        .withMessage('isRecurring must be a boolean'),
    body('recurrencePattern')
        .if(body('isRecurring').equals(true))
        .isIn(['daily', 'weekly', 'monthly'])
        .withMessage('Recurrence pattern must be daily, weekly, or monthly'),
    body('recurrenceInterval')
        .if(body('isRecurring').equals(true))
        .isInt({ min: 1 })
        .withMessage('Recurrence interval must be a positive integer'),
    body('recurrenceEndDate')
        .if(body('isRecurring').equals(true))
        .isISO8601()
        .withMessage('Recurrence end date must be a valid ISO date'),
    body('daysOfWeek')
        .optional()
        .isArray()
        .withMessage('Days of week must be an array')
        .custom((value) => {
            if (value && value.some(day => day < 0 || day > 6)) {
                throw new Error('Days of week must be between 0 and 6');
            }
            return true;
        })
];

exports.updateStatusValidator = [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('status')
        .trim()
        .notEmpty()
        .isIn(['available', 'booked', 'confirmed', 'completed', 'cancelled'])
        .withMessage('Invalid appointment status')
];