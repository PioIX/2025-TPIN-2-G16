var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');

const session = require("express-session"); // Para el manejo de las variables de sesión

const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: 'http://localhost:3000', // o el puerto donde corre tu Next.js
  credentials: true
}));

// Para parsear JSON
app.use(express.json());

const server = app.listen(port, function () {
console.log(`Server running in http://localhost:${port}`);
});

const io = require('socket.io')(server, {
cors: {
origin: ["http://localhost:3000", "http://localhost:3001"],
methods: ["GET", "POST", "PUT", "DELETE"],
credentials: true
}
});

const sessionMiddleware = session({
secret: "supersarasa",
resave: false,
saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
sessionMiddleware(socket.request, {}, next);
});

app.get('/', function (req, res) {
res.status(200).send({
message: 'GET Home route working fine!'
});
});

app.get('/jugadores', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM Jugadores WHERE id_jugador=${req.query.id_jugador}`)
} else {
respuesta = await realizarQuery("SELECT * FROM Jugadores");
}
res.send(respuesta);
})

app.get('/clientes', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM Clientes WHERE id_cliente=${req.query.id_cliente}`)
} else {
respuesta = await realizarQuery("SELECT * FROM Clientes");
}
res.send(respuesta);
})

app.get('/juegos', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM Juegos WHERE id_juego=${req.query.id_juego}`)
} else {
respuesta = await realizarQuery("SELECT * FROM Juegos");
}
res.send(respuesta);
})

app.get('/jugadoresjuego', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM JuegadoresJuego WHERE id_jugadoresjuego=${req.query.id_jugadoresjuego}`)
} else {
respuesta = await realizarQuery("SELECT * FROM JuegadoresJuego");
}
res.send(respuesta);
})

app.get('/resultadoxjugador', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM ResultadoxJugador WHERE id_jresultadoxjugador=${req.query.id_jresultadoxjugador}`)
} else {
respuesta = await realizarQuery("SELECT * FROM ResultadoxJugador");
}
res.send(respuesta);
})

app.get('/hamburguesas', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM Hamburguesas WHERE id_hamburguesa=${req.query.id_hamburguesa}`)
} else {
respuesta = await realizarQuery("SELECT * FROM Hamburguesas");
}
res.send(respuesta);
})

app.get('/calidadhamburguesa', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM Hamburguesas WHERE id_calidadhamburguesa=${req.query.id_calidadhamburguesa}`)
} else {
respuesta = await realizarQuery("SELECT * FROM Hamburguesas");
}
res.send(respuesta);
})

app.get('/clientexjuego', async function (req, res) {
let respuesta;
if (req.query.id_user != undefined) {
respuesta = await realizarQuery(`SELECT * FROM ClientexJuego WHERE id_clientexjuego=${req.query.id_clientexjuego}`)
} else {
respuesta = await realizarQuery("SELECT * FROM ClientexJuego");
}
res.send(respuesta);
})

app.post('/jugadores', async function (req, res) {
    try{
        console.log(req.body);
        const jugador = await realizarQuery(`
        INSERT INTO Jugadores (nombre_usuario, email, contraseña,) VALUES
        ('${req.body.nombre_usuario}', '${req.body.email}', '${req.body.contraseña}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/clientes', async function (req, res) {
    try{
        console.log(req.body);
        const cliente = await realizarQuery(`
        INSERT INTO Clientes (nombre, personaje, pedido,) VALUES
        ('${req.body.nombre}', '${req.body.personaje}', '${req.body.pedido}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/juegos', async function (req, res) {
    try{
        console.log(req.body);
        const juego = await realizarQuery(`
        INSERT INTO Juegos (codigo, dia) VALUES
        ('${req.body.codigo}', '${req.body.dia}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/jugadoresjuego', async function (req, res) {
    try{
        console.log(req.body);
        const jugadorjuego = await realizarQuery(`
        INSERT INTO JugadoresJuego (id_jugador, id_juego, id_resultado,) VALUES
        ('${req.body.id_jugador}', '${req.body.id_juego}', '${req.body.id_resultado}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/resultadoxjugador', async function (req, res) {
    try{
        console.log(req.body);
        const resultadoxjugador = await realizarQuery(`
        INSERT INTO ResultadoxJugador (tiempo, puntos, id_jugador, id_juego) VALUES
        ('${req.body.tiempo}', '${req.body.puntos}', '${req.body.id_jugador}', '${req.body.id_juego}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/hamburguesas', async function (req, res) {
    try{
        console.log(req.body);
        const hamburguesa = await realizarQuery(`
        INSERT INTO Hamburguesas (tipo, ingrediente1, ingrediente2, ingrediente3) VALUES
        ('${req.body.tipo}', '${req.body.ingrediente1}', '${req.body.ingrediente2}', '${req.body.ingrediente3}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/calidadhamburguesa', async function (req, res) {
    try{
        console.log(req.body);
        const calidadhamburguesa = await realizarQuery(`
        INSERT INTO CalidadHamburguesa (id_hamburguesa, calidad, cantIngrediente1, cantIngrediente2, cantIngrediente3) VALUES
        ('${req.body.id_hamburguesa}', '${req.body.calidad}', '${req.body.cantIngrediente1}', '${req.body.cantIngrediente1}', '${req.body.cantIngrediente1}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/clientexjuego', async function (req, res) {
    try{
        console.log(req.body);
        const clientexjuego = await realizarQuery(`
        INSERT INTO ClientexJuego (id_juego, id_cliente, id_hamburguesa) VALUES
        ('${req.body.id_juego}', '${req.body.id_cliente}', '${req.body.id_hamburguesa}');
        `);
        } catch (error) {
        console.error(error);
    }
});

app.post('/loginUsuario', async function (req, res) {
  console.log("Intento de login:", req.body);
  
  try {
    // Validar que lleguen los datos
    if (!req.body.nombre_usuario || !req.body.contraseña) {
      return res.status(400).send({
        validar: false, 
        message: "Debes completar todos los campos"
      });
    }

    // Usar prepared statements para prevenir SQL injection
    const result = await realizarQuery(
      'SELECT * FROM Jugadores WHERE nombre_usuario = ? AND contraseña = ?',
      [req.body.nombre_usuario, req.body.contraseña]
    );
    
    if (result.length > 0) {
      console.log("Login exitoso para:", result[0].nombre_usuario);
      res.send({
        validar: true, 
        id: result[0].id_jugador,
        nombre_usuario: result[0].nombre_usuario
      });
    } else {
      res.send({
        validar: false,
        message: "Usuario o contraseña incorrectos"
      });
    }
  } catch (error) {
    console.error("Error al buscar usuario:", error);
    res.status(500).send({
      validar: false,
      message: "Error en el servidor"
    });
  }
});

app.post('/registroUsuario', async function (req, res) {
  console.log("Intento de registro:", req.body);
  try {
    // Validar que lleguen todos los datos
    if (!req.body.nombre_usuario || !req.body.email || !req.body.contraseña) {
      return res.status(400).send({
        res: false,
        message: "Debes completar todos los campos"
      });
    }
    // Verificar si el email ya existe
    const existingEmail = await realizarQuery(
      'SELECT * FROM Jugadores WHERE email = ?',
      [req.body.email]
    );
    if (existingEmail.length > 0) {
      return res.send({
        res: false,
        message: "Ya existe un usuario con este email"
      });
    }
    // Verificar si el nombre de usuario ya existe
    const existingUsername = await realizarQuery(
      'SELECT * FROM Jugadores WHERE nombre_usuario = ?',
      [req.body.nombre_usuario]
    );
    if (existingUsername.length > 0) {
      return res.send({
        res: false,
        message: "El nombre de usuario ya está en uso"
      });
    }
    // Insertar el nuevo usuario con prepared statements
    const insertResult = await realizarQuery(
      'INSERT INTO Jugadores (nombre_usuario, email, contraseña) VALUES (?, ?, ?)',
      [req.body.nombre_usuario, req.body.email, req.body.contraseña]
    );
    console.log("Usuario registrado exitosamente. ID:", insertResult.insertId);
    res.send({
      res: true,
      message: "Usuario registrado correctamente",
      id: insertResult.insertId
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res.status(500).send({
      res: false,
      message: "Error en el servidor al registrar usuario"
    });
  }
});

app.get('/clientesPedido', async function (req, res) {
  const clienteId = req.query.id_cliente;
  console.log("Buscando pedido del cliente:", clienteId);
  
  try {
    let result;
    
    if (clienteId) {
      result = await realizarQuery(
        'SELECT id_cliente, nombre, personaje, pedido FROM Clientes WHERE id_cliente = ?',
        [clienteId]
      );
    } else {
      result = await realizarQuery(
        'SELECT id_cliente, nombre, personaje, pedido FROM Clientes ORDER BY RAND() LIMIT 1'
      );
    }
    // Enviar la respuesta con el formato esperado
    res.json({
      clienteNombre: result[0].nombre || '',
      pedido: result[0].pedido || '',
      personaje: result[0].personaje || '',
      id_cliente: result[0].id_cliente
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ 
      error: 'Error al obtener el pedido' 
    });
  }
});

io.on("connection", (socket) => {
const req = socket.request;
console.log('Usuario conectado:', socket.id);

socket.on('joinRoom', data => {
console.log("🚀 ~ io.on ~ req.session.room:", req.session.room)
if (req.session.room != undefined && req.session.room.length > 0){
socket.leave(req.session.room);
}
req.session.room = data.room;
socket.join(req.session.room);

console.log("Usuario se unió a sala:", req.session.room);

// También unirse a la sala específica del chat
socket.join(data.room);
console.log("Usuario también en sala específica:", data.room);

// Notificar a todos en la sala
io.to(req.session.room).emit('chat-messages', {
user: req.session.user,
room: req.session.room,
joined: true
});
});

socket.on('pingAll', data => {
console.log("PING ALL: ", data);
io.emit('pingAll', { event: "Ping to all", message: data });
});

socket.on('sendMessage', (data) => {
io.to(req.session.room).emit("newMessage", {
room: req.session.room,
message: data
});

realizarQuery(`
INSERT INTO Messages (photo, date, id_user, content, id_chat) VALUES
(${data.photo != undefined ? "" : null},'${data.date}',${data.userId},'${data.content}', '${data.chatId}');
`);
const existingRelation = realizarQuery(`
SELECT * FROM UsersxChat WHERE id_user = ${data.userId} AND id_chat = ${data.chatId}
`);
if (existingRelation.length === 0) {
realizarQuery(`
INSERT INTO UsersxChat (id_user, id_chat) VALUES
(${data.userId}, ${data.chatId});
`);
}

});

socket.on('disconnect', () => {
console.log("Usuario desconectado:", socket.id);
})
});


// FUNCIÓN realizarQuery (asegúrate de tener esta función)
function realizarQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    conexion.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}