const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const swaggerPath = path.resolve(__dirname, '../docs/swagger-bundled.yaml');
const swaggerSpec = YAML.load(swaggerPath);

module.exports = { swaggerUi, swaggerSpec };
