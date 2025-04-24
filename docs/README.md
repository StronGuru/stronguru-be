# 📚 StronGuru API – Developer Guide (JS Modular Swagger)

Benvenuto/a nello sviluppo backend di StronGuru. Questa guida ti aiuterà a mantenere e validare la documentazione Swagger API con un’architettura modulare in JavaScript, facilmente estendibile e scalabile.

## 📁 Struttura della cartella `docs/`
```
docs/
├── swagger.js               # Entry point principale (esporta lo Swagger spec)
├── auth.js                  # Rotte /auth (login, signup, logout, refresh)
├── users.js                 # Rotte /users
├── professionals.js         # Rotte /professionals (CRUD + password)
├── clientUsers.js              # Rotte /clientUsers
├── token.js                 # Attivazione account tramite token
├── userDevices.js           # Rotte /devices
├── components/
│   └── schemas.js           # Schemi riutilizzabili (User, Professional, ecc.)
└── scripts/
    └── dump-swagger.js      # Script per esportare lo spec e validarlo
```

## ⚙️ Configurazione Swagger in Express

In `index.js`:
```js
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```
Apri la documentazione su:  
👉 [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

## ✍️ Come aggiungere nuove rotte o moduli

1. Crea un nuovo file JS in `docs/`, es: `feedback.js`
2. Esporta un oggetto contenente i path
3. Importa e aggiungi in `docs/swagger.js`, dentro `paths: { ... }`:
```js
const feedback = require('./feedback');

paths: {
  ...users,
  ...auth,
  ...feedback,
}
```

## 🧩 Come modificare o creare uno schema

Aggiungi o modifica uno schema in `docs/components/schemas.js`. Esempio:
```js
MyModel: {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
  },
}
```
Usalo in una risposta con:
```js
$ref: '#/components/schemas/MyModel'
```

## 🔐 Autenticazione e Sicurezza

Le rotte protette devono includere lo schema `bearerAuth`:
```js
security: [
  { bearerAuth: [] }
]
```
Nel `docs/swagger.js`, è già definito in `components.securitySchemes`.

## ✅ Validazione della documentazione Swagger

Per validare la documentazione JS (modulare):

1. Esporta lo Swagger in JSON:
```bash
npm run docs:export
```
2. Valida il file generato:
```bash
npm run docs:validate
```
Questo verifica che la struttura del file sia conforme a OpenAPI 3.

## 🧪 Test locale tramite Swagger UI

Avvia il server:
```bash
npm run dev
```
Vai su: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

Clicca su **Authorize** e inserisci il token JWT nel formato:
```
Bearer <your_token>
```

## 💡 Best Practices per la documentazione

✅ Mantieni ogni risorsa (auth, users, ecc.) in file separati  
✅ Scrivi descrizioni, summary e tag in inglese  
✅ Riutilizza gli schemi dove possibile (`$ref`)  
✅ Valida frequentemente (`npm run docs:validate`)  
✅ Non documentare inline dentro ai controller JS  
✅ Usa sempre `bearerAuth` dove serve sicurezza  

## 📦 Script npm utili

| Comando               | Cosa fa                                                |
|-----------------------|--------------------------------------------------------|
| `npm run dev`         | Avvia il server in modalità sviluppo                   |
| `npm run docs:export` | Esporta Swagger spec da JS a `swagger-output.json`    |
| `npm run docs:validate` | Valida Swagger spec esportato                         |
| `npm run docs:preview`  | Apre Swagger UI su browser (`/api-docs`)             |

## 📬 Domande frequenti

| Obiettivo                           | Azione                                                        |
|------------------------------------|---------------------------------------------------------------|
| Aggiungere una nuova entità        | Crea `docs/<entità>.js` + importa in `swagger.js`             |
| Documentare uno schema complesso   | Aggiungilo in `docs/components/schemas.js`                    |
| Autenticazione con JWT             | Aggiungi `security: [{ bearerAuth: [] }]` alla rotta         |
| Validare lo Swagger spec           | `npm run docs:validate`                                       |
| Condividere lo spec esternamente   | Condividi `swagger-output.json` generato                      |

## ✨ Prossimi step consigliati

- Integrare `docs:validate` in CI/CD  
- Aggiungere esempi a tutte le responses  
- Internazionalizzazione della documentazione (i18n)  
- Generare bundle pubblico se necessario (`swagger-cli bundle`)
