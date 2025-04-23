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
                    email: 'athlete1@example.com',
                    role: 'athlete',
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
};
