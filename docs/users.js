module.exports = {
  '/users': {
    get: {
      summary: 'Retrieve the complete list of users',
      tags: ['User'],
      description: 'Returns all users in the system. Accessible only by administrators.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully retrieved the list of users',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },
        401: { description: 'Unauthorized – JWT is missing or invalid' },
        403: { description: 'Forbidden – You do not have permission to access this resource' },
        500: { description: 'Internal server error' }
      }
    }
  }
};
