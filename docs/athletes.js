module.exports = {
  '/athletes': {
    get: {
      summary: 'Retrieve all registered athletes',
      tags: ['Athlete'],
      description: 'Returns a list of all users with the "athlete" role. Admin access only.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of athletes successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Athlete',
                },
                example: [
                  {
                    _id: '6634567890abcdef12345678',
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
        401: { description: 'Unauthorized – JWT token missing or invalid' },
        403: { description: 'Forbidden – Admin access required' },
        500: { description: 'Internal server error' },
      },
    },
  },
};
