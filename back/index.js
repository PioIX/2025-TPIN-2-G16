var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');

const session = require("express-session"); // Para el manejo de las variables de sesión

const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicio express
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
    try {
        const existingJugador = await realizarQuery(`
SELECT * FROM Jugadores WHERE email = "${req.body.email}";
`);

        console.log("existingJugador: ", existingJugador)

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

    // CREAR SALA
    socket.on("createRoom", async (data) => {
        try {
            const { id_jugador } = data;

            // Generar código único (6 caracteres)
            const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Crear la sala en la base
            const queryRoom = `
INSERT INTO Juegos (codigo)
VALUES ('${codigo}')
`;
            const result = await realizarQuery(queryRoom);

            // Obtener el id_juego insertado
            const id_juego = result.insertId;

            // Insertar al host en JugadoresJuego (el primer jugador será el host)
            const queryJugador = `
INSERT INTO JugadoresJuego (id_jugador, id_juego, id_result)
VALUES (${id_jugador}, ${id_juego}, NULL)
`;
            await realizarQuery(queryJugador);

            // Unir al socket a la sala
            socket.join(codigo);

            console.log(`Sala creada: ${codigo} por host ${id_jugador}`);
            socket.emit("roomCreated", { code: codigo, id_game: id_juego });

            // Obtener jugadores de la sala (por ahora solo el host)
            const jugadores = await realizarQuery(`
SELECT
    j.id_jugador,
    j.nombre_usuario,
    CASE WHEN jj.id_jugador = (
        SELECT id_jugador 
        FROM JugadoresJuego 
        WHERE id_juego = ${id_juego} 
        ORDER BY id_jugadorjuego ASC 
        LIMIT 1
    ) THEN 1 ELSE 0 END AS esHost
FROM JugadoresJuego jj
JOIN Jugadores j ON jj.id_jugador = j.id_jugador
WHERE jj.id_juego = ${id_juego}
ORDER BY jj.id_jugadorjuego ASC
`);

            console.log("Enviando jugadores:", JSON.stringify(jugadores, null, 2));

            // Enviar a todos en la sala
            io.to(codigo).emit("updateJugadores", jugadores);

        } catch (err) {
            console.error("Error al crear sala:", err);
            socket.emit("errorRoom", "No se pudo crear la sala");
        }
    });

    // UNIRSE A SALA
    socket.on("joinRoom", async (data) => {
        try {
            const { code, id_jugador } = data;

            // Verificar que la sala existe
            const sala = await realizarQuery(`
SELECT id_juego FROM Juegos WHERE codigo = '${code}'
`);

            if (sala.length === 0) {
                socket.emit("errorRoom", "La sala no existe");
                return;
            }

            const id_juego = sala[0].id_juego;

            // Verificar que no haya más de 2 jugadores
            const jugadoresActuales = await realizarQuery(`
SELECT COUNT(*) as total FROM JugadoresJuego WHERE id_juego = ${id_juego}
`);

            if (jugadoresActuales[0].total >= 2) {
                socket.emit("errorRoom", "La sala está llena");
                return;
            }

            // Verificar que el jugador no esté ya en la sala
            const yaEnSala = await realizarQuery(`
SELECT * FROM JugadoresJuego
WHERE id_juego = ${id_juego} AND id_jugador = ${id_jugador}
`);

            if (yaEnSala.length > 0) {
                socket.emit("errorRoom", "Ya estás en esta sala");
                return;
            }

            // Insertar al jugador en la sala
            const queryJugador = `
INSERT INTO JugadoresJuego (id_jugador, id_juego, id_result)
VALUES (${id_jugador}, ${id_juego}, NULL)
`;
            await realizarQuery(queryJugador);

            // Unir al socket a la sala
            socket.join(code);

            console.log(`Jugador ${id_jugador} se unió a sala ${code}`);
            socket.emit("roomJoined", { code, id_game: id_juego });

            // Obtener todos los jugadores actualizados
            const jugadores = await realizarQuery(`
SELECT
    j.id_jugador,
    j.nombre_usuario,
    CASE WHEN jj.id_jugador = (
        SELECT id_jugador 
        FROM JugadoresJuego 
        WHERE id_juego = ${id_juego} 
        ORDER BY id_jugadorjuego ASC 
        LIMIT 1
    ) THEN 1 ELSE 0 END AS esHost
FROM JugadoresJuego jj
JOIN Jugadores j ON jj.id_jugador = j.id_jugador
WHERE jj.id_juego = ${id_juego}
ORDER BY jj.id_jugadorjuego ASC
`);

            // Notificar a todos en la sala
            io.to(code).emit("updateJugadores", jugadores);

        } catch (err) {
            console.error(" Error al unirse a sala:", err);
            socket.emit("errorRoom", "No se pudo unir a la sala");
        }
    });

    // INICIAR JUEGO
    socket.on("startGame", async (data) => {
        try {
            const { code } = data;

            console.log(`🎮 Iniciando juego en sala ${code}`);

            // Verificar que hay 2 jugadores
            const sala = await realizarQuery(`
SELECT id_juego FROM Juegos WHERE codigo = '${code}'
`);

            if (sala.length === 0) {
                socket.emit("errorRoom", "Sala no encontrada");
                return;
            }

            const id_juego = sala[0].id_juego;

            const jugadores = await realizarQuery(`
SELECT COUNT(*) as total FROM JugadoresJuego WHERE id_juego = ${id_juego}
`);

            if (jugadores[0].total < 2) {
                socket.emit("errorRoom", "Se necesitan 2 jugadores para iniciar");
                return;
            }

            // Notificar a todos en la sala que el juego comienza
            io.to(code).emit("gameStart", { code });

        } catch (err) {
            console.error(" Error al iniciar juego:", err);
            socket.emit("errorRoom", "No se pudo iniciar el juego");
        }
    });

    // DESCONEXIÓN
    socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
    });
});