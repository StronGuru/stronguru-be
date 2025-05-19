module.exports = {
  '/auth/login': {
    post: {
      summary: 'Authenticate user and return JWT tokens',
      tags: ['Auth'],
      parameters: [
        {
          name: 'X-Device-Type',
          in: 'header',
          description: 'Type of device making the request',
          required: false,
          schema: {
            type: 'string',
            enum: ['desktop', 'mobile'],
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@gmail.com' },
                password: {
                  type: 'string',
                  example: 'yourPassword123',
                  description: 'Must not be empty',
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
                  token: { type: 'string', example: 'jwt_access_token' },
                  refreshToken: { type: 'string', example: 'jwt_refresh_token' },
                },
              },
            },
          },
        },
        400: { description: 'Missing email or password' },
        401: { description: 'Invalid credentials or unverified account' },
        403: { description: 'Access denied for this device type' },
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
                'specializations',
                'dateOfBirth',
                'gender',
                'phone'
              ],
              properties: {
                firstName: { type: 'string', example: 'Mario' },
                lastName: { type: 'string', example: 'Rossi' },
                email: { type: 'string', example: 'mario.rossi@studio.com' },
                password: { $ref: '#/components/schemas/Password' },
                dateOfBirth: { $ref: '#/components/schemas/DateOfBirth' },
                gender: { $ref: '#/components/schemas/Gender' },
                phone: { $ref: '#/components/schemas/Phone' },
                acceptedTerms: { type: 'boolean', example: true },
                acceptedPrivacy: { type: 'boolean', example: true },
                specializations: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['trainer', 'nutritionist'],
                },
                contactEmail: {
                  type: 'string',
                  format: 'email',
                  example: 'studio@rossi.com'
                },
                contactPhone: {
                  type: 'string',
                  example: '+393331112222'
                },
                pIva: {
                  type: 'string',
                  minLength: 11,
                  maxLength: 13,
                  example: '12345678901',
                },
                taxCode: {
                  type: 'string',
                  minLength: 11,
                  example: 'RSSMRA90A01H501U',
                },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string', example: 'Via Milano 12' },
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
        201: { description: 'Professional registered successfully' },
        400: {
          description: 'Missing or invalid fields (terms, privacy, specialization)',
        },
        409: { description: 'Email already in use' },
        500: { description: 'Server error during registration' },
      },
    },
  },

  '/auth/signup/user': {
    post: {
      summary: 'Register a new user (ClientUser)',
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
                'dateOfBirth',
                'gender',
                'phone'
              ],
              properties: {
                firstName: { type: 'string', example: 'Luca' },
                lastName: { type: 'string', example: 'Bianchi' },
                email: { type: 'string', example: 'luca.bianchi@example.com' },
                password: { $ref: '#/components/schemas/Password' },
                dateOfBirth: { $ref: '#/components/schemas/DateOfBirth' },
                gender: { $ref: '#/components/schemas/Gender' },
                phone: { $ref: '#/components/schemas/Phone' },
                acceptedTerms: { type: 'boolean', example: true },
                acceptedPrivacy: { type: 'boolean', example: true },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'User registered successfully. Activation email sent.',
        },
        400: { description: 'Missing required fields or validation error' },
        409: { description: 'User already exists' },
        500: { description: 'Server error during registration' },
      },
    },
  },

  '/auth/refresh-token': {
    post: {
      summary: 'Generate a new access token using the refresh token and device ID',
      tags: ['Auth'],
      parameters: [
        {
          name: 'x-device-id',
          in: 'header',
          required: true,
          schema: { type: 'string' },
          description: 'Device ID associated with the session',
          example: '664567890abcdef123456789'
        },
        {
          name: 'refreshToken',
          in: 'cookie',
          required: true,
          schema: { type: 'string' },
          description: 'Refresh token stored in secure HTTP-only cookie',
        }
      ],
      responses: {
        200: {
          description: 'New access token issued',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string', example: 'newAccessToken' },
                }
              }
            }
          }
        },
        400: { description: 'Missing token or device ID' },
        403: { description: 'Invalid device or token' },
        500: { description: 'Internal server error' }
      },
    },
  },

  '/auth/logout': {
    post: {
      summary: 'Log out the current user',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully logged out',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Logged out successfully' },
                },
              },
            },
          },
        },
        500: { description: 'Server error during logout' },
      },
    },
  },

  '/auth/forgot-password': {
    post: {
      summary: 'Request password reset email',
      parameters: [
        {
          name: 'X-Device-Type',
          in: 'header',
          description: 'Type of device making the request',
          required: false,
          schema: {
            type: 'string',
            enum: ['desktop', 'mobile'],
          },
        },
      ],
      tags: ['Auth'],
      description: 'Sends a password reset token to the provided email if the user exists and has verified their account.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'user@example.com',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password reset email sent (even if user does not exist)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'If the email exists, a reset link was sent.',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Internal server error',
        },
      },
    },
  },

  '/auth/reset-password': {
    post: {
      summary: 'Reset password using token',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'newPassword'],
              properties: {
                token: {
                  type: 'string',
                  example: 'abc123resettoken'
                },
                newPassword: { $ref: '#/components/schemas/Password' }
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Password successfully updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Password reset successfully.' },
                },
              },
            },
          },
        },
        400: { description: 'Invalid or expired token' },
        404: { description: 'User not found' },
        500: { description: 'Internal server error' },
      },
    },
  },
};