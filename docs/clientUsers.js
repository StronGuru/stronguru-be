module.exports = {
  '/clientUsers': {
    get: {
      summary: 'Retrieve all registered clientUsers',
      tags: ['ClientUser'],
      description: 'Returns a list of all client users. Admin access only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of clientUsers successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ClientUser' },
              },
            },
          },
        },
        401: { description: 'Unauthorized – JWT token missing or invalid' },
        403: { description: 'Forbidden – Admin access required' },
        500: { description: 'Internal server error' },
      },
    },
  },

  '/clientUsers/{id}': {
    get: {
      summary: 'Retrieve a clientUser by ID',
      tags: ['ClientUser'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the clientUser to retrieve',
        }
      ],
      responses: {
        200: {
          description: 'ClientUser successfully retrieved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ClientUser' },
            },
          },
        },
        401: { description: 'Unauthorized – JWT token missing or invalid' },
        404: { description: 'ClientUser not found' },
        500: { description: 'Internal server error' },
      },
    },

    patch: {
      summary: 'Update a clientUser profile',
      tags: ['ClientUser'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the clientUser to update',
        }
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
                phone: { $ref: '#/components/schemas/Phone' },
                gender: { $ref: '#/components/schemas/Gender' },
                address: {
                  type: 'object',
                  properties: {
                    street: { type: 'string' },
                    city: { type: 'string' },
                    province: { type: 'string' },
                    cap: { type: 'string' },
                    country: { type: 'string' },
                  },
                },
                fitnessLevel: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                },
                activityLevel: {
                  type: 'string',
                  enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'],
                },
                goals: {
                  type: 'array',
                  items: { type: 'string' },
                  enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility'],
                },
                preferences: {
                  type: 'array',
                  items: { type: 'string' },
                  enum: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'],
                },
                currentSports: {
                  type: 'array',
                  items: { type: 'string' },
                },
                competitiveLevel: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                },
                socialLinks: {
                  type: 'object',
                  additionalProperties: { type: 'string' },
                },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'ClientUser successfully updated' },
        400: { description: 'Bad Request – No valid fields provided' },
        401: { description: 'Unauthorized – JWT token missing or invalid' },
        403: { description: 'Forbidden – Not authorized to update' },
        404: { description: 'ClientUser not found' },
        500: { description: 'Internal server error' },
      },
    },

    delete: {
      summary: 'Delete a clientUser account',
      tags: ['ClientUser'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'ID of the clientUser to delete',
        }
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
                  description: 'Password confirmation required to delete the account',
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
        401: { description: 'Unauthorized – Invalid password or token' },
        403: { description: 'Forbidden – Not allowed to delete this account' },
        404: { description: 'ClientUser not found' },
        500: { description: 'Internal server error' },
      },
    },
  },
};
