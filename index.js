require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const passport = require('passport');


const app = express();

//inizializzazione passport
require('./config/passport')(passport);
app.use(passport.initialize());

app.use(methodOverride('_method'));

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Usa Swagger UI per documentare le API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error('MONGO_URI non configurato correttamente: ' + mongoURI);
    process.exit(1); // Interrompi l'app se manca la configurazione
}

mongoose.connect(mongoURI)
    .then(() => console.log('Connesso al database MongoDB!'))
    .catch(err => console.error('Errore di connessione al database:', err));

//gestione errori globali -Ms
app.use((err, req, res, next) => {
    console.error('Errore globale:', err.stack);
    res.status(500).json({message: 'Errore interno del server'});
});

// Configurazione per servire file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rotta principale per servire la pagina HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rotte API

const authAPI = require('./routes/auth');
app.use('/auth', authAPI);

const tokenAPI = require('./routes/token');
app.use('/token', tokenAPI);

const usersAPI = require('./routes/users');
app.use('/users', usersAPI);

// const professionistsAPI = require('./routes/professionists');
// app.use('/professionists', professionistsAPI);

// const dietAPI = require('./routes/diet');
// app.use('/diet', dietAPI);

// const psychoAPI = require('./routes/psycho');
// app.use('/psycho', psychoAPI);

// const gymAPI = require('./routes/gym');
// app.use('/gym', gymAPI);

// const calendarAPI = require('./routes/calendar');
// app.use('/calendar', calendarAPI);

// const recipesAPI = require('./routes/recipes');
// app.use('/recipes', recipesAPI);

// const settingsAPI = require('./routes/settingsPro');
// app.use('/settings', settingsAPI);

// const productsAPI = require('./routes/products');
// app.use('/products', productsAPI);


// Porta e avvio server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
});
