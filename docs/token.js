module.exports = {
  '/token/activate/{token}': {
    get: {
      summary: 'Activate a user account via token',
      tags: ['Token'],
      description: 'Verifies the activation token, activates the user account, and deletes the token from the database.',
      parameters: [
        {
          name: 'token',
          in: 'path',
          required: true,
          description: 'Activation token sent to the user via email',
          schema: {
            type: 'string',
            example: 'd4f9a4c8a6bc4f4e9fd12345678abcde',
          },
        },
      ],
      responses: {
        200: {
          description: 'Account successfully activated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Account successfully activated!',
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Invalid or expired token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Invalid or expired token',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Server error during account activation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Error during account activation',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
