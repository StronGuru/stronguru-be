module.exports = {
  '/devices/user/{userId}': {
    get: {
      summary: 'Get all devices associated with a specific user',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'userId',
          required: true,
          description: 'ID of the user',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'List of user devices successfully retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/UserDevice' },
              },
            },
          },
        },
        500: { description: 'Server error while retrieving devices' },
      },
    },
  },

  '/devices/{id}': {
    get: {
      summary: 'Get a single device by its ID',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          description: 'Device ID',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: {
          description: 'Device found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserDevice' },
            },
          },
        },
        404: { description: 'Device not found' },
        500: { description: 'Server error' },
      },
    },

    delete: {
      summary: 'Delete a device by its ID',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          description: 'ID of the device to delete',
          schema: { type: 'string' },
        },
      ],
      responses: {
        200: { description: 'Device successfully deleted' },
        404: { description: 'Device not found' },
        500: { description: 'Error while deleting the device' },
      },
    },
  },
};
