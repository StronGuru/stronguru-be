const users = require('./users');
const auth = require('./auth');
const professionals = require('./professionals');
const clientUsers = require('./clientUsers');
const token = require('./token');
const userDevices = require('./userDevices');
const appointments = require('./appointments');
const schemas = require('./components/schemas');

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'StronGuru API Documentation',
    version: '1.0.0',
    description: 'Centralized and modular documentation of StronGuru backend APIs.',
  },
  // servers: [
  //   {
  //     url: 'http://localhost:8080',
  //     description: 'Local development server',
  //   },
  // ],
  paths: {
    ...users,
    ...auth,
    ...professionals,
    ...clientUsers,
    ...token,
    ...userDevices,
    ...appointments
  },
  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      customHeaderAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-device-id',
        description: 'Custom header required for identifying tenant or request origin',
      },
    },
  },
  // Applica entrambi gli schemi di sicurezza a livello globale
  security: [
    {
      bearerAuth: []
    }
  ]
};
