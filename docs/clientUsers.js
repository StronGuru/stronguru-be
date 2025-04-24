module.exports = {
  '/clientUsers': {
    get: {
      summary: 'Retrieve all registered clientUsers',
      tags: ['ClientUser'],
      description: 'Returns a list of all users with the "user" role. Admin access only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of clientUsers successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/clientUser',
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
};
