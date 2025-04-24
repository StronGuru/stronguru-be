const fs = require('fs');
const swagger = require('../swagger'); // relativo a /docs

fs.writeFileSync('./docs/build/swagger-output.json', JSON.stringify(swagger, null, 2));
console.log('✅ Swagger spec esportato in swagger-output.json');
