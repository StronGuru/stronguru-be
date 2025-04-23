module.exports = {
  '/auth/login': {
    post: {
      summary: 'Authenticate user and return JWT tokens',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'client'],
              properties: {
                email: { type: 'string', example: 'user@gmail.com' },
                password: { type: 'string', example: 'password123' },
                client: {
                  type: 'string',
                  enum: ['web', 'mobile'],
                  example: 'web',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'User authenticated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: 'Missing email, password, or client' },
        401: { description: 'Invalid credentials or unverified account' },
        403: { description: 'Access denied for this client type' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/auth/signup/professional': {
    post: {
      summary: 'Register a new professional',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: [
                'firstName',
                'lastName',
                'email',
                'password',
                'acceptedTerms',
                'acceptedPrivacy',
                'role',
                'specializations',
              ],
              properties: {
                firstName: { type: 'string', example: 'Mario' },
                lastName: { type: 'string', example: 'Rossi' },
                email: { type: 'string', example: 'user@gmail.com' },
                password: { type: 'string', example: 'password123' },
                dateOfBirth: { type: 'string', format: 'date', example: '1990-01-01' },
                gender: { type: 'string', example: 'male' },
                phone: { type: 'string', example: '3216549870' },
                taxCode: { type: 'string', example: 'RSSMRA90A01H501U' },
                pIva: { type: 'string', example: '01234567890' },
                contactEmail: { type: 'string', example: 'studio@gmail.com' },
                contactPhone: { type: 'string', example: '3216549870' },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string', example: 'Via Roma 123' },
                    city: { type: 'string', example: 'Milano' },
                    province: { type: 'string', example: 'MI' },
                    zipCode: { type: 'string', example: '20100' },
                  },
                },
                acceptedTerms: { type: 'boolean', example: true },
                acceptedPrivacy: { type: 'boolean', example: true },
                specializations: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['nutritionist'],
                },
                role: {
                  type: 'string',
                  example: 'professional',
                },
              },
            },
          },
        },
      },
      responses: {
        201: { description: 'Professional registered successfully' },
        400: { description: 'Missing or invalid fields (terms, privacy, specializations)' },
        409: { description: 'Email already in use' },
        500: { description: 'Server error during registration' },
      },
    },
  },

  '/auth/refresh-token': {
    post: {
      summary: 'Generate a new access token using the refresh token',
      tags: ['Auth'],
      responses: {
        200: { description: 'New access token issued' },
        401: { description: 'Invalid or missing refresh token' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/auth/logout': {
    post: {
      summary: 'Log out the current user',
      tags: ['Auth'],
      responses: {
        200: { description: 'Successfully logged out' },
        500: { description: 'Server error during logout' },
      },
    },
  },
};
