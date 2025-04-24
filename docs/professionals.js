module.exports = {
  '/professionals': {
    get: {
      summary: 'Retrieve all registered professionals',
      tags: ['Professional'],
      description: 'Returns a list of all professionals. Admin access only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of professionals successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Professional' },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT missing or invalid' },
        403: { description: 'Forbidden – Admin access required' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/professionals/professional/{id}': {
    get: {
      summary: 'Get professional by ID (excluding password)',
      tags: ['Professional'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      responses: {
        200: {
          description: 'Professional successfully retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Professional' },
            },
          },
        },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },

    put: {
      summary: 'Update professional profile (excluding password)',
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'Mario' },
                lastName: { type: 'string', example: 'Rossi' },
                phone: { type: 'string', example: '3216549870' },
                biography: {
                  type: 'string',
                  example: 'Certified nutritionist and trainer with 10 years of experience.',
                },
                specializations: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['nutritionist'],
                },
                contactEmail: { type: 'string', example: 'studio@gmail.com' },
                contactPhone: { type: 'string', example: '3216549870' },
                languages: { type: 'array', items: { type: 'string' }, example: ['en', 'it'] },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string', example: 'Via Roma 123' },
                    city: { type: 'string', example: 'Milano' },
                    province: { type: 'string', example: 'MI' },
                    cap: { type: 'string', example: '20100' },
                    country: { type: 'string', example: 'Italy' },
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Profile updated successfully' },
        400: { description: 'No valid fields provided' },
        403: { description: 'Unauthorized – You can only modify your own profile' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },

    delete: {
      summary: 'Delete professional account (requires password)',
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['password'],
              properties: {
                password: {
                  type: 'string',
                  example: 'password123',
                  description: 'Current password to confirm account deletion',
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Account successfully deleted' },
        400: { description: 'Password missing' },
        401: { description: 'Incorrect password' },
        403: { description: 'Unauthorized deletion attempt' },
        404: { description: 'Professional not found' },
        500: { description: 'Server error during deletion' },
      },
    },
  },

  '/professionals/professional/{id}/password': {
    put: {
      summary: "Update professional's password",
      tags: ['Professional'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: "Professional's ID",
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
                newPassword: { type: 'string', example: 'newSecurePassword456' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Password updated successfully' },
        400: { description: 'Missing parameters' },
        401: { description: 'Old password incorrect' },
        403: { description: 'Unauthorized – You can only update your own password' },
        404: { description: 'Professional not found' },
        500: { description: 'Internal server error' },
      },
    },
  },
};
