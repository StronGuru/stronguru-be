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
                professionalExp: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['5 years at X', 'Freelancer since 2019'],
                },
                certifications: {
                  type: 'array',
                  items: { type: 'string' },
                },
                expStartDate: {
                  type: 'string',
                  format: 'date',
                  example: '2015-06-01',
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
