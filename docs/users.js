module.exports = {
  '/users': {
    get: {
      summary: 'Retrieve the complete list of users',
      tags: ['User'],
      description: 'Returns all users in the system. Only accessible by administrators.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of users successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' },
                example: [
                  {
                    _id: '6634567890abcdef12345678',
                    firstName: 'Mario',
                    lastName: 'Rossi',
                    email: 'user@gmail.com',
                    role: 'professional',
                    dateOfBirth: '1990-01-01',
                    gender: 'male',
                    phone: '3216549870',
                  },
                  {
                    _id: '6634567890abcdef12345679',
                    firstName: 'Anna',
                    lastName: 'Bianchi',
                    email: 'clientUser@example.com',
                    role: 'user',
                    dateOfBirth: '1995-04-10',
                    gender: 'female',
                    phone: '3216549871',
                  },
                ],
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT is missing or invalid' },
        403: { description: 'Forbidden – Admin access required' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/users/{id}/ambassador': {
    patch: {
      summary: 'Update ambassador status for any user (Admin only)',
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "ID of the user",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['ambassador'],
              properties: {
                ambassador: {
                  type: 'boolean',
                  example: true,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Ambassador status updated',
        },
        400: { description: 'Invalid value' },
        403: { description: 'Admin access required' },
        404: { description: 'User not found' },
        500: { description: 'Server error' },
      },
    },
  },

  '/users/ambassadors': {
    get: {
      summary: 'Get all ambassador users, optionally filtered by role',
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'role',
          in: 'query',
          required: false,
          schema: {
            type: 'string',
            enum: ['user', 'professional', 'admin'],
          },
          description: 'Optional filter by user role',
        },
      ],
      responses: {
        200: {
          description: 'List of ambassadors retrieved successfully',
        },
        403: { description: 'Admin access required' },
        500: { description: 'Server error' },
      },
    },
  },

  '/users/{id}/password': {
    patch: {
      summary: "Update user's password",
      tags: ['User'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "ID of the user",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['oldPassword', 'newPassword'],
              properties: {
                oldPassword: { type: 'string', example: 'password123' },
                newPassword: { type: 'string', example: 'newPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Password updated successfully' },
        400: { description: 'Missing parameters or empty password fields' },
        401: { description: 'Incorrect old password' },
        403: { description: 'Unauthorized to update this password' },
        404: { description: 'User not found' },
        500: { description: 'Server error during password update' },
      },
    },
  },
};
