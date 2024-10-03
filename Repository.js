const { Sequelize, DataTypes } = require('sequelize');

// Credenciales de la base de datos desde las variables de entorno
const databaseName = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT || 5432;  // Si Render te proporciona un puerto

const sequelize = new Sequelize(databaseName, username, password, {
  host: host,
  port: port,
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Permite conexiones seguras a bases de datos externas
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
    autoIncrement: true,  // Esto funciona en PostgreSQL como SERIAL
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
}, {
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

const connectAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.error('Stack trace:', error.stack);
  }  
};

connectAndSync();

//Exporta el Certificado hacia app.js como 'Certificate's
module.exports = { sequelize, Persona, Usuario, Administrador, Blog, Comentario };