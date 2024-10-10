const express = require('express');
const router = express();

const path = require('path');
const { Persona, Usuario, Blog, Comentario } = require('./Repository');
router.use(express.json());

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
      next();
  } else {
      res.status(401).send('No autorizado');
  }
};

const isAdmin = async (req, res, next) => {
  console.log(req.session); // Verificar sesión
  if (req.session.userId) {
      try {
          const usuario = await Usuario.findOne({ where: { userId: req.session.userId } });
          console.log(usuario); // Verificar el usuario
          if (usuario && usuario.esAdmin) {
              next();
          } else {
              res.status(403).send('Acceso denegado');
          }
      } catch (error) {
          console.error(error);
          res.status(500).send('Error en la verificación de administrador');
      }
  } else {
      res.status(401).send('No autorizado');
  }
};


// Ruta para la página principal
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      order: [['Nro', 'DESC']] // Ordenar por ID de blog en orden descendente
    });
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar los blogs');
  }
});

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/register.html'));
});

// Ruta para procesar el registro
router.post('/register', async (req, res) => {
  const { nombre, Id, contraseña, esAdmin } = req.body;

  if (!Id || !contraseña) {
      return res.status(400).send('ID y contraseña son requeridos.');
  }

  try {
      const Persona1 = await Persona.create({
          userId: Id,
          contraseña: contraseña,
      });

      await Usuario.create({
          userId: Persona1.userId,
          nombre: nombre,
          contraseña: contraseña,
          esAdmin: esAdmin === 'on', // Checkbox marcado será 'on', si no está marcado será undefined
      });

      res.sendFile(path.join(__dirname, '../public/html/login.html'));
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/html/login.html'));
});

// Ruta para procesar el login
router.post('/login', async (req, res) => {
  const { userId, contraseña } = req.body;
  try {
      const usuario = await Usuario.findOne({ where: { userId, contraseña } });

      if (usuario) {
          req.session.userId = usuario.userId;
          res.redirect('/dashboard');
      } else {
          res.status(401).send('Credenciales incorrectas');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al procesar el inicio de sesión');
  }
});

// Ruta para el dashboard
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
      const usuario = await Usuario.findOne({ where: { userId: req.session.userId } });
      if (usuario.esAdmin) {
          res.sendFile(path.join(__dirname, '../public/html/admin-dashboard.html'));
      } else {
          res.sendFile(path.join(__dirname, '../public/html/user-dashboard.html'));
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error al cargar el dashboard');
  }
});

// 2. Registro en el lado del servidor
router.post('/create-blog', isAdmin, async (req, res) => {
  console.log('Solicitud de creación de blog recibida:', req.body);

  const { nombre, texto } = req.body;

  if (!nombre || !texto) {
      console.log('Faltan campos requeridos');
      return res.status(400).send('Todos los campos son requeridos.');
  }

  try {
      console.log('Creando nuevo blog con:', { nombre, texto, autorId: req.session.userId });
      const nuevoBlog = await Blog.create({
          nombre: nombre,
          texto: texto,
          autorId: req.session.userId,
          createdAt: new Date(),
          updatedAt: new Date(),
      });

      console.log('Nuevo blog creado:', nuevoBlog.toJSON());
      res.status(201).json(nuevoBlog);
  } catch (error) {
      console.error('Error al crear el blog:', error);
      res.status(500).json({ error: error.message });
  }
});
// Ruta para obtener todos los posts
router.get('/posts', async (req, res) => {
  try {
      const posts = await Blog.findAll({
          order: [['Nro', 'DESC']],
      });
      res.json(posts);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los posts');
  }
});

// Ruta para obtener los blogs del admin
router.get('/admin-blogs', isAdmin, async (req, res) => {
  try {
      const blogs = await Blog.findAll({
          where: { autorId: req.session.userId },
          order: [['Nro', 'DESC']],
      });
      res.json(blogs);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al obtener los blogs del admin');
  }
});

// Ruta para editar un blog
router.post('/edit-blog/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, texto } = req.body;

  if (!req.session.userId) {
    return res.status(401).send('No autorizado');
  }

  try {
    await Blog.update(
      { nombre, texto, updatedAt: new Date() },
      { where: { Nro: id, autorId: req.session.userId } } // Asegúrate de que el autor sea el que lo editó
    );
    res.status(200).json({ message: 'Blog actualizado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al editar el blog');
  }
});

// Ruta para eliminar un blog
router.post('/delete-blog/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.session.userId) {
    return res.status(401).send('No autorizado');
  }

  try {
    const result = await Blog.destroy({
      where: {
        Nro: id,
        autorId: req.session.userId // Solo permite eliminar si el autor es el mismo
      }
    });

    if (result === 0) {
      return res.status(404).send('Blog no encontrado o no autorizado para eliminar');
    }

    res.status(200).json({ message: 'Blog eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el blog');
  }
});



// Ruta para agregar un comentario
router.post('/comment/:blogId', isAuthenticated, async (req, res) => {
  const { texto } = req.body;
  const blogId = req.params.blogId;

  try {
      const nuevoComentario = await Comentario.create({
          texto,
          blogId,
          autorId: req.session.userId,
          createdAt: new Date(),
      });

      res.status(201).json(nuevoComentario);
  } catch (error) {
      console.error(error);
      res.status(500).send('Error al agregar el comentario');
  }
});

// Ruta para obtener los comentarios de un blog específico
router.get('/comments/:blogId', async (req, res) => {
  const { blogId } = req.params;
  try {
      const comentarios = await Comentario.findAll({
          where: { blogId },
          order: [['createdAt', 'ASC']]
      });
      res.json(comentarios);
  } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).send('Error al obtener los comentarios');
  }
});

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/');
  });
});

// Ruta para verificar el estado de la sesión
router.get('/session-status', (req, res) => {
  if (req.session.userId) {
      Usuario.findOne({ where: { userId: req.session.userId } })
          .then(usuario => {
              if (usuario) {
                  res.json({ loggedIn: true, nombre: usuario.nombre, esAdmin: usuario.esAdmin });
              } else {
                  res.json({ loggedIn: false });
              }
          })
          .catch(error => {
              console.error('Error al obtener información del usuario:', error);
              res.status(500).json({ error: 'Error del servidor' });
          });
  } else {
      res.json({ loggedIn: false });
  }
});
