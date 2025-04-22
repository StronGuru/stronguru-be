📚 StronGuru API Documentation – Developer Guide
Benvenuto/a nella documentazione modulare delle API di StronGuru.
Questa guida ti aiuterà a navigare, estendere e mantenere Swagger in modo ordinato, professionale e scalabile.

📁 Struttura della cartella docs/
docs/
├── swagger.yaml               # Entry point principale per Swagger
├── users.yaml                 # Rotte /users
├── auth.yaml                  # Login, registrazione, logout, refresh
├── professionals.yaml         # Rotte /professionals (CRUD + password)
├── athletes.yaml              # Rotte /athletes
├── token.yaml                 # Attivazione account tramite token
├── userDevices.yaml           # Rotte /devices
└── components/
    └── schemas.yaml           # Tutti gli schemi riutilizzabili (User, Professional, ecc.)

⚙️ Configurazione Swagger in Express

    Nel file config/swagger.js:
        const swaggerUi = require('swagger-ui-express');
        const YAML = require('yamljs');
        const swaggerDocument = YAML.load('./docs/swagger.yaml');

        module.exports = {
        swaggerUi,
        swaggerSpec: swaggerDocument
        };

    Nel file index.js:
        const { swaggerUi, swaggerSpec } = require('./config/swagger');
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


    Puoi ora aprire la documentazione su:
    👉 http://localhost:8080/api-docs


🧩 Come aggiungere una nuova rotta
    1. Crea un nuovo file YAML, ad esempio: docs/feedback.yaml

    2. Aggiungi il riferimento in swagger.yaml:

    paths:
    /feedback:
        $ref: './feedback.yaml#/paths/~1feedback'

    Nota: usa ~1 al posto della / nei riferimenti a path YAML (/feedback → ~1feedback)


✍️ Come aggiungere o modificare uno schema
    Vai in docs/components/schemas.yaml e aggiungi il nuovo schema:

        MyModel:
        type: object
        properties:
            id:
            type: string
            name:
            type: string

    Poi puoi riutilizzarlo in una risposta con:

        $ref: '#/components/schemas/MyModel'


🔐 Autenticazione e Sicurezza
    Tutte le rotte protette usano bearerAuth come schema di sicurezza.

    Aggiungilo così dentro ogni path protetto:

        security:
        - bearerAuth: []


🧪 Come testare localmente
    Avvia il server con npm start

    Vai su http://localhost:8080/api-docs

    Clicca su "Authorize" in alto a destra

    Inserisci il token JWT nel formato: Bearer <your_token_here>


✅ Validazione del file YAML
    Per verificare che la documentazione sia corretta:

    Installa swagger-cli (una volta sola):

        nginx
        npm install -g swagger-cli
        
    Valida:

        swagger-cli validate docs/swagger.yaml


💡 Best practices
    Mantieni ogni risorsa (users, auth, ecc.) in un file YAML separato

    Riutilizza gli schemi definiti in components/schemas.yaml

    Scrivi tutte le descrizioni, summary, e tag in inglese

    Evita la documentazione Swagger inline dentro ai file .js

    Valida il file swagger.yaml regolarmente

📬 Cosa fare se...

    Obiettivo	Azione
    Aggiungere una nuova entità	Crea docs/<entità>.yaml + aggiorna swagger.yaml
    Documentare uno schema complesso	Aggiungi in docs/components/schemas.yaml
    Gestire sicurezza con JWT	Aggiungi security: - bearerAuth: [] alla rotta
    Testare da Swagger UI	Usa il pulsante "Authorize" con token JWT

🔄 (Extra - Da fare in futuro)
    Aggiungere example: nei requestBody e responses

    Estendere con supporto multilingua Swagger (i18n)

    Integrare validazione Swagger in CI/CD (GitHub Actions / GitLab)

    Aggiungere script npm run docs:validate nel package.json

✨ Per dubbi o suggerimenti, contatta il team backend o apri una PR sul branch swagger-cleanup.