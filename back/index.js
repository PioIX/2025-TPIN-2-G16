var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');

const session = require("express-session"); // Para el manejo de las variables de sesión

const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

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

app.post('/loginUsuario', async function (req, res) {
console.log("Resultado de búsqueda:", req.body);
try {
const result = await realizarQuery(`
SELECT * FROM Jugadores WHERE nombre_usuario = "${req.body.nombre_usuario}" AND contraseña = "${req.body.contraseña}";
`);
if (result.length > 0) {
res.send({ validar: true, id: result[0].id_jugador })
} else {
res.send({ validar: false })
}
} catch (error) {
console.log("Error al buscar usuario:", error);
res.status(500).send({ error: "No se pudo buscar el usuario" });
}
});

app.post('/registroUsuario', async function (req, res) {
console.log(req.body)
try {
const existingJugador = await realizarQuery(`
SELECT * FROM Jugadores WHERE email = "${req.body.email}";
`);
if (existingJugador.length > 0) {
res.send({ res: false, message: "Ya existe un usuario con este email" });
return;
}
const insertResult = await realizarQuery(`
INSERT INTO Jugadores (nombre_usuario, email, contraseña)
VALUES ("${req.body.nombre_usuario}", "${req.body.email}", "${req.body.contraseña}");
`);
console.log("Usuario registrado:", insertResult);
res.send({ res: true, message: "Usuario registrado correctamente" });
} catch (error) {
console.log("Error al ingresar", error)
}
})

app.get('/clientesPedido', async function (req, res) {
try {
// Obtener un cliente aleatorio de la base de datos
const result = await realizarQuery(
`SELECT nombre, pedido FROM Clientes ORDER BY RAND() LIMIT 1`
);

// Si no hay clientes en la base de datos
if (result.length === 0) {
return res.status(404).json({
error: 'No hay clientes disponibles'
});
}

// Enviar la respuesta con el texto
res.json({
id_cliente: result[0].id_cliente || '',
clienteNombre: result[0].nombre || '',
pedidoText: result[0].pedido || ''
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
if (req.session.room != undefined && req.session.room.length > 0) {
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
