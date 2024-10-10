const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Credenciales de la base de datos desde las variables de entorno
const databaseName = process.env.DB_NAME; // Asegúrate de que DB_NAME esté definida
const username = process.env.DB_USER; // Asegúrate de que DB_USER esté definida
const password = process.env.DB_PASS; // Asegúrate de que DB_PASS esté definida

const host = process.env.DB_HOST; // Solo el nombre del host
const port = process.env.DB_PORT; // Asegúrate de que esto esté definido

const sequelize = new Sequelize(process.env.DB_URL, {
  dialect: 'postgres',
  dialectOptions: {
      ssl: {
          require: true,
          rejectUnauthorized: false // Cambia esto a true en producción
      }
  }
});

// Definición del modelo Persona
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
}, {
  timestamps: false,
});

// Modificación del modelo Usuario
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
  esAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, {
  timestamps: false,
});

// Definición del modelo Administrador
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
}, {
  timestamps: false,
});

// Relaciones
Usuario.belongsTo(Persona, {
  foreignKey: 'userId',
  targetKey: 'userId',
});

Administrador.belongsTo(Persona, {
  foreignKey: 'userId',
  targetKey: 'userId',
});

// Definición del modelo Blog
const Blog = sequelize.define('Blog', {
  Nro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  autorId: {
    type: Sequelize.CHAR, 
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

// Definición del modelo Comentario
const Comentario = sequelize.define('Comentario', {
  Nro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  texto: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  blogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  autorId:{
    type: Sequelize.CHAR, 
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: false,
});

// Relaciones
Blog.hasMany(Comentario, {
  foreignKey: 'blogId',
  sourceKey: 'Nro',
});

Comentario.belongsTo(Blog, {
  foreignKey: 'blogId',
  targetKey: 'Nro',
});

const connectAndSync = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sincroniza los modelos con la base de datos
    await sequelize.sync({ force: false }); // Cambia a true si deseas borrar las tablas existentes
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.error('Stack trace:', error.stack);
  }  
};

connectAndSync();

// Log para verificar la configuración
console.log('DB_HOST:', host);
console.log('DB_PORT:', port);
console.log('DB_NAME:', databaseName);
console.log('DB_USER:', username);


//Exporta el Certificado hacia app.js como 'Certificate's
module.exports = { sequelize, Persona, Usuario, Administrador, Blog, Comentario };