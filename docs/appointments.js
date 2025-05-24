module.exports = {
    '/appointments/slots': {
        post: {
            tags: ['Appointments'],
            summary: 'Create a new appointment slot',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/CreateAppointmentSlot' }
                    }
                }
            },
            responses: {
                201: {
                    description: 'Appointment slot created successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Appointment' }
                        }
                    }
                },
                400: { description: 'Invalid input' },
                401: { description: 'Unauthorized' }
            }
        },
        get: {
            tags: ['Appointments'],
            summary: 'Get available appointment slots',
            parameters: [
                {
                    in: 'query',
                    name: 'professionalId',
                    schema: { type: 'string' },
                    description: 'Filter slots by professional ID'
                },
                {
                    in: 'query',
                    name: 'startDate',
                    schema: { type: 'string', format: 'date' },
                    description: 'Filter slots from this date'
                },
                {
                    in: 'query',
                    name: 'endDate',
                    schema: { type: 'string', format: 'date' },
                    description: 'Filter slots until this date'
                }
            ],
            responses: {
                200: {
                    description: 'List of available slots',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Appointment' }
                            }
                        }
                    }
                }
            }
        }
    },

    '/appointments/slots/{id}/book': {
        post: {
            tags: ['Appointments'],
            summary: 'Book an appointment slot',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Appointment slot ID'
                }
            ],
            responses: {
                200: {
                    description: 'Appointment booked successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Appointment' }
                        }
                    }
                },
                400: { description: 'Invalid input or slot already booked' },
                401: { description: 'Unauthorized' },
                404: { description: 'Slot not found' }
            }
        }
    },

    '/appointments/my-appointments': {
        get: {
            tags: ['Appointments'],
            summary: 'Get user appointments',
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: 'List of user appointments',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Appointment' }
                            }
                        }
                    }
                },
                401: { description: 'Unauthorized' }
            }
        }
    },

    '/appointments/{id}/status': {
        patch: {
            tags: ['Appointments'],
            summary: 'Update appointment status',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'Appointment ID'
                }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/UpdateAppointmentStatus' }
                    }
                }
            },
            responses: {
                200: {
                    description: 'Appointment status updated successfully',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Appointment' }
                        }
                    }
                },
                400: { description: 'Invalid status' },
                401: { description: 'Unauthorized' },
                403: { description: 'Forbidden' },
                404: { description: 'Appointment not found' }
            }
        }
    }
};