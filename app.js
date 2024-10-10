const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Asegúrate de que la ruta sea correcta
const { sequelize } = require('./Repository'); // Importar la configuración de Sequelize

const app = express();

const PORT = process.env.PORT || 10000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configuración de sesiones
app.use(session({
  secret: 'tu_secreto', // Cambia esto por una cadena de secreto fuerte
  resave: false,
  saveUninitialized: true,
}));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Uso de rutas
app.use('/', routes);

// Iniciar el servidor y conectar a la base de datos
const startServer = async () => {
  try {
    await sequelize.authenticate(); // Comprobar conexión a la base de datos
    console.log('Connection has been established successfully.');

    // Sincronizar modelos
    await sequelize.sync();
    console.log('Models synchronized successfully.');

    app.listen(PORT, () => {
        console.log(`App running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Salir si no se puede conectar a la base de datos
  }
};

startServer();