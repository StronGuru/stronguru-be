require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const passport = require('passport');
const useragent = require('express-useragent');
const corsConfig = require('./config/corsConfig');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');



const app = express();

//inizializzazione passport
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(useragent.express());
app.use(cookieParser());

app.use(methodOverride('_method'));

app.use(cors(corsConfig));

app.use(express.json());
app.set('trust proxy', true);
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

// Configurazione per servire file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rotta principale per servire la pagina HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes API
const authAPI = require('./modules/auth/routes');
app.use('/auth', authAPI);

const tokenAPI = require('./modules/token/routes');
app.use('/token', tokenAPI);

const usersAPI = require('./modules/users/routes');
app.use('/users', usersAPI);

const professionalAPI = require('./modules/professionals/routes');
app.use('/professionals', professionalAPI);

const clientUsersAPI = require('./modules/clientUsers/routes');
app.use('/clientUsers', authMiddleware(), clientUsersAPI);

const userDevicesAPI = require('./modules/userDevices/routes');
app.use('/devices', authMiddleware(), userDevicesAPI);

const appointmentsAPI = require('./modules/appointments/routes');
app.use('/appointments', appointmentsAPI);

//After the routes!
app.use(errorHandler);


// Porta e avvio server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🚀 Server in esecuzione su http://localhost:${PORT}`);
});
