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
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', example: 'user@gmail.com' },
                password: { type: 'string', example: 'password123' },
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
                password: { type: 'string', example: 'password123' },
                dateOfBirth: { type: 'string', format: 'date', example: '1995-06-15' },
                gender: { type: 'string', example: 'male' },
                phone: { type: 'string', example: '+393334445556' },
                acceptedTerms: { type: 'boolean', example: true },
                acceptedPrivacy: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User registered successfully. Activation email sent.',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Registrazione user riuscita. Per favore controlla la tua email per verificare l\'account'
                  },
                  userId: {
                    type: 'string',
                    example: '661e2b8f67e4fc5c9dfc9a91'
                  },
                  activationKey: {
                    type: 'string',
                    example: 'a3fdd5bc8ef3f542e10a1c2d4a0c4f2b'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Missing required fields or validation error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'È necessario accettare termini e privacy policy' },
                  error: { type: 'string', example: 'Errore nella registrazione dello user' }
                }
              }
            }
          }
        },
        409: {
          description: 'User already exists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Utente già registrato con questa email' }
                }
              }
            }
          }
        },
        500: {
          description: 'Server error during registration',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Errore nella registrazione dello user' },
                  error: { type: 'string', example: 'Unexpected error' }
                }
              }
            }
          }
        }
      }
    }
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

  '/auth/forgot-password': {
    post: {
      summary: 'Request password reset email',
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
                  example: 'user@gmail.com'
                }
              }
            }
          }
        }
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
                    example: 'Password reset email sent.'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  },

  '/auth/reset-password': {
    post: {
      summary: 'Reset password using token',
      tags: ['Auth'],
      description: 'Resets the user\'s password if the provided token is valid and not expired.',
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
                newPassword: {
                  type: 'string',
                  example: 'newPassword123'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Password successfully updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Password reset successfully.'
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Invalid or expired token'
        },
        404: {
          description: 'User not found'
        },
        500: {
          description: 'Internal server error'
        }
      }
    }
  }
};