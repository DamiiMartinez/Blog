//Se usara el npm 'Sequelize' para interactuar con la Base de Datos
const { Sequelize, DataTypes } = require('sequelize');
const mysql = require('mysql2/promise');

// Credenciales de la base de datos
const databaseName = 'Blog';
const username = 'root';
const password = '';
const host = 'localhost';

// Función para crear la base de datos si no existe
const createDatabaseIfNotExists = async (databaseName) => {
  try {
    const connection = await mysql.createConnection({ host, user: username, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\`;`);

    console.log(`Database "${databaseName}" created or already exists.`);
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1); // Salir si ocurre un error al crear la base de datos
  }
};

// Crear la base de datos antes de inicializar Sequelize
createDatabaseIfNotExists(databaseName);

// Configuración de Sequelize
const sequelize = new Sequelize(databaseName, username, password, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Definición del modelo de ejemplo: Envia los datos del certificado a una tabla MySQL
const Persona = sequelize.define('Persona', {
  userId: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
},{
  timestamps: false,
});

const Usuario = sequelize.define('Usuario', {
  userId: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
},{
  timestamps: false,
});

const Administrador = sequelize.define('Administrador', {
  userId: {
    type: DataTypes.CHAR,
    allowNull: false,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  contraseña: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  Permiso: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
},{
  timestamps: false,
});

Usuario.belongsTo(Persona,{
  foreignKey: 'userId',
  targetKey: 'userId',
});

Administrador.belongsTo(Persona,{
  foreignKey: 'userId',
  targetKey: 'userId',
});

const Blog = sequelize.define('Blog', {
  Nro: {
    type: DataTypes.INTEGER,
    allowNull: false,

    primaryKey: true,
    autoIncrement: true, // No es necesario el primaryKey aquí si Id ya es la clave primaria
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
},{
  timestamps: false,
});

const Comentario = sequelize.define('Comentario', {
  Nro: {
    type: DataTypes.INTEGER,
    allowNull: false,

    primaryKey: true,
    autoIncrement: true, // No es necesario el primaryKey aquí si Id ya es la clave primaria
  },
  Id: {
    type: DataTypes.CHAR,
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
},{
  timestamps: false,
});

Blog.belongsTo(Administrador, {
  foreignKey: 'Id',
  targetKey: 'userId',
});

Comentario.belongsTo(Blog, {
  foreignKey: 'Nro',
  targetKey: 'Nro',
});

// Intentar conectar y sincronizar
const connectAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sincronizar modelos
    await sequelize.sync();
    console.log('Models synchronized successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Salir si ocurre otro error
  }
};

connectAndSync();

//Exporta el Certificado hacia app.js como 'Certificate's
module.exports = { sequelize, Persona, Usuario, Administrador, Blog, Comentario };