const express = require('express');
const app = express.Router(); 

const { sequelize, Persona, Usuario, Administrador, Blog, Comentario } = require('./Repository'); 

const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default; // Asegúrate de usar .default
const redis = require('redis');

// Crea un cliente de Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL // URL de Redis desde las variables de entorno
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
  await redisClient.connect();
})();

// Configura express-session para usar Redis
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'tu_secreto_aqui', // Usa una variable de entorno para el secreto
  resave: false,
  saveUninitialized: false
}));

const dirname = __dirname;

// Configurar body-parser para manejar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Página de inicio con opciones para registrarse o iniciar sesión
app.get('/', (req, res) => {
    res.sendFile(path.join(dirname, './' ,'public' ,'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(dirname, './' ,'public' ,'login.html'));
});

app.get('/crear', (req, res) => {
  res.sendFile(path.join(dirname, './' ,'public' ,'crear.html'));
});

app.get('/administrador', (req, res) => {
  res.sendFile(path.join(dirname, './' ,'public' ,'administrador.html'));
});

app.get('/posts', async (req, res) => {
  try {
      // Obtener todos los posts desde la tabla Blog
      const posts = await Blog.findAll();
      
      res.json(posts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los posts');
  }
});

app.post('/crear_cuenta', async (req, res) => {
  const { nombre, Id, contraseña, permiso, administrador } = req.body;

  try {
    const Persona1 = await Persona.create({
      userId: Id,
      contraseña: contraseña,
    });

    const Usuario1 = await Usuario.create({
      userId: Persona1.userId,
      nombre: nombre,
      contraseña: contraseña,
    });

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/crear_administrador', async (req, res) => {
  const { nombre, Id, contraseña} = req.body;

  try {
    const Persona1 = await Persona.create({
      userId: Id,
      contraseña: contraseña,
    });

    const administrador1 = await Administrador.create({
      userId: Persona1.userId,
      nombre: nombre,
      contraseña: contraseña,
      permiso: '1',
    });

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/sesion_cuenta', async (req, res) => {
  const { Id, contraseña } = req.body;

  try {
      const Usuario1 = await Usuario.findOne({where: {userId: Id, contraseña:contraseña,}});

      const Administrador1 = await Administrador.findOne({where: {userId: Id, contraseña:contraseña,}});

      if(Usuario1){
        req.session.id=Usuario1.userId;
        req.session.contraseña=Usuario1.contraseña;
        req.session.nombre=Usuario1.nombre;
        console.log('usuario');
        res.redirect('/');
      }

      else if(Administrador1){
        req.session.id=Administrador1.userId;
        req.session.contraseña=Administrador1.contraseña;
        req.session.nombre=Administrador1.nombre;
        req.session.permiso= 1;
        console.log('admin');
        res.redirect('/');
      }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/crear_post', async (req, res) => {
  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ error: 'El campo texto es obligatorio' });
  }

  try {
    const Post1 = await Blog.create({
      nombre: req.session.nombre,
      texto: texto,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


app.get('/sesion', async (req, res) => {
  let isAdmin;
  try {
      if(req.session.permiso){
        isAdmin="administrador";
      }

      else if(req.session.nombre){
        isAdmin="usuario";
      }
      res.json(isAdmin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/cerrar', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).send('Error al cerrar sesión');
      }
      // Redirigir a la página de inicio o login
      res.redirect('/');
  });
});

// Nuevo endpoint para eliminar un post usando el número
app.delete('/eliminar_post/:nro', async (req, res) => {
  const postNro = req.params.nro;

  try {
      const deletedPost = await Blog.destroy({
          where: { Nro: postNro }
      });

      if (deletedPost) {
          res.status(200).json({ message: 'Post eliminado exitosamente' });
      } else {
          res.status(404).json({ message: 'Post no encontrado' });
      }
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});

module.exports = app;