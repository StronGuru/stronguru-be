// swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Definisci le opzioni per swagger-jsdoc
const options = {
  definition: {
    openapi: '3.0.0', // La versione di OpenAPI che stai utilizzando
    info: {
      title: 'API Documentazione',
      version: '1.0.0',
      description: 'Documentazione delle API StronGuru',
    },
  },
  // Percorsi per cercare i file con i commenti JSDoc
  apis: ['./routes/*.js'], // Assicurati che punti ai tuoi file API
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerUi, swaggerSpec };