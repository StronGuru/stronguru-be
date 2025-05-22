module.exports = {
  '/professionals': {
    get: {
      summary: 'Retrieve all registered professionals',
      tags: ['Professional'],
      description: 'Returns a list of all professionals.',
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

  '/professionals/{id}': {
    get: {
      summary: 'Get professional by ID (excluding password)',
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

    patch: {
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
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { $ref: '#/components/schemas/Phone' },
                gender: { $ref: '#/components/schemas/Gender' },
                contactEmail: {
                  type: 'string',
                  format: 'email',
                  example: 'studio@pro.it',
                },
                contactPhone: { type: 'string', example: '+393331112233' },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    cap: { type: 'string' },
                    province: { type: 'string' },
                    country: { type: 'string' },
                  },
                },
                languages: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['it', 'en'],
                },
                qualifications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      degreeTitle: {
                        type: 'string',
                        description: 'Academic degree (e.g. Diploma, Bachelor\'s Degree, Master\'s Degree, PhD, etc.)',
                        required: true,
                        example: 'Master\'s Degree'
                      },
                      institution: {
                        type: 'string',
                        description: 'Name of the institution that issued the degree',
                        required: true,
                        example: 'University of Milan'
                      },
                      fieldOfStudy: {
                        type: 'string',
                        description: 'Field of study (e.g. Sport Sciences, Nutrition and Food Sciences, etc.)',
                        required: true,
                        example: 'Sport Sciences'
                      },
                      startDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Start date of studies',
                        required: true,
                        example: '2018-09-01'
                      },
                      completionDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Date when the degree was obtained',
                        required: true,
                        example: '2021-07-15'
                      }
                    }
                  }
                },
                certifications: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      certificationName: {
                        type: 'string',
                        description: 'Name of the certification',
                        required: true,
                        example: 'Personal Trainer Certification'
                      },
                      issuingOrganization: {
                        type: 'string',
                        description: 'Name of the organization that issued the certification',
                        required: true,
                        example: 'FIPE'
                      },
                      level: {
                        type: 'string',
                        description: 'Level or grade of the certification (e.g. B2, Basic Level, Professional)',
                        required: false,
                        example: 'Professional'
                      },
                      certificationId: {
                        type: 'string',
                        description: 'Official identification number of the certification',
                        required: false,
                        example: 'PT2023-1234'
                      },
                      certificationUrl: {
                        type: 'string',
                        description: 'URL link to the certification',
                        required: false,
                        example: 'https://certification-verify.org/PT2023-1234'
                      },
                      issueDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Date when the certification was issued',
                        required: true,
                        example: '2023-01-15'
                      },
                      expirationDate: {
                        type: 'string',
                        format: 'date',
                        description: 'Expiration date of the certification (if applicable)',
                        required: false,
                        example: '2026-01-15'
                      }
                    }
                  }
                },
                socialLinks: {
                  type: 'object',
                  properties: {
                    instagram: { type: 'string', example: 'https://instagram.com/pro' },
                    linkedin: { type: 'string' },
                    facebook: { type: 'string' },
                    other: { type: 'string' },
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
                  description: 'Current password to confirm account deletion',
                  example: 'yourPassword123',
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
};
