module.exports = {
  '/devices': {
    get: {
      summary: 'Get all devices associated with a specific user',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List of user devices ',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/UserDevice' },
                example: [
                  {
                    _id: '664567890abcdef123456789',
                    user: '6634567890abcdef12345678',
                    ipAddress: '192.168.1.10',
                    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    deviceType: 'desktop',
                    refreshToken: 'abc123token',
                    isActive: true,
                    lastAccessed: '2024-04-01T10:15:00Z',
                  },
                ],
              },
            },
          },
        },
        500: { description: 'Server error while retrieving devices' },
      },
    },
  },

  '/devices/{deviceid}': {
    get: {
      summary: 'Get a single device by its ID',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deviceId',
          required: true,
          description: 'Device ID',
          schema: { type: 'string', example: '664567890abcdef123456789' },
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
        500: { description: 'Server error while retrieving the device' },
      },
    },

    delete: {
      summary: 'Delete a device by its ID',
      tags: ['UserDevices'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'deviceId',
          required: true,
          description: 'ID of the device to delete',
          schema: { type: 'string', example: '664567890abcdef123456789' },
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
