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
                items: {
                  $ref: '#/components/schemas/ClientUser',
                },
                example: [
                  {
                    _id: '6634567890abcdef12345678',
                    firstName: 'Anna',
                    lastName: 'Bianchi',
                    email: 'clientUser1@example.com',
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
      description: 'Returns the details of a specific clientUser by their ID.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the clientUser to retrieve',
          schema: {
            type: 'string',
            example: '6634567890abcdef12345678',
          },
        },
      ],
      responses: {
        200: {
          description: 'ClientUser successfully retrieved',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ClientUser',
              },
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
      description: 'Updates allowed fields of the clientUser profile. Only the user themselves can update their data.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the clientUser to update',
          schema: {
            type: 'string',
            example: '6634567890abcdef12345678',
          },
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
                dateOfBirth: { type: 'string', format: 'date', example: '1990-05-15' },
                biography: { type: 'string', example: 'Gym-lover from 10 years.' },
                profileImg: { type: 'string', example: 'https://example.com/images/profile.jpg' },
                socialLinks: { type: 'array', items: { type: 'string' }, example: ['https://facebook.com/mario', 'https://twitter.com/mario'] },
                gender: { type: 'string', example: 'male' },
                healthData: {
                  type: 'object',
                  properties: {
                    height: { type: 'number', example: 180 },
                    weight: { type: 'number', example: 75 },
                  },
                },
                fitnessLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'intermediate' },
                goals: { type: 'array', items: { type: 'string' }, enum: ['weight_loss', 'muscle_gain', 'endurance', 'flexibility'], example: ['muscle_gain'] },
                activityLevel: { type: 'string', enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active'], example: 'moderately_active' },
                preferences: { type: 'array', items: { type: 'string' }, enum: ['vegan', 'vegetarian', 'gluten_free', 'dairy_free'], example: ['vegetarian'] },
                currentSports: { type: 'array', items: { type: 'string' }, example: ['running', 'swimming'] },
                competitiveLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], example: 'advanced' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'ClientUser successfully updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ClientUser',
              },
            },
          },
        },
        400: { description: 'Bad Request – No valid fields provided' },
        401: { description: 'Unauthorized – JWT token missing or invalid' },
        403: { description: 'Forbidden – User not authorized to update this profile' },
        404: { description: 'ClientUser not found' },
        500: { description: 'Internal server error' },
      },
    },

    delete: {
      summary: 'Delete a clientUser account',
      tags: ['ClientUser'],
      description: 'Deletes a clientUser account after verifying password. Only the user themselves can delete their account.',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the clientUser to delete',
          schema: {
            type: 'string',
            example: '6634567890abcdef12345678',
          },
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
                password: { type: 'string', example: 'yourPassword123' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: 'Account successfully deleted' },
        400: { description: 'Bad Request – Password missing' },
        401: { description: 'Unauthorized – Invalid password or token' },
        403: { description: 'Forbidden – User not authorized to delete this account' },
        404: { description: 'ClientUser not found' },
        500: { description: 'Internal server error' },
      },
    },
  },
};
