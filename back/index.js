var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const session = require("express-session");
const { realizarQuery } = require('./modulos/mysql');

var app = express();
var port = process.env.PORT || 4000;

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

// LOGIN - CORREGIDO CON LOGS
app.post('/loginUsuario', async function (req, res) {
    console.log("📥 Login - Datos recibidos:", req.body);
    try {
        const result = await realizarQuery(`
            SELECT * FROM Jugadores WHERE nombre_usuario = "${req.body.nombre_usuario}" AND contraseña = "${req.body.contraseña}";
        `);
        
        console.log("🔍 Resultado de la query:", result);
        
        if (result.length > 0) {
            console.log("✅ Login exitoso - ID del jugador:", result[0].id_jugador);
            res.send({ 
                validar: true, 
                id: result[0].id_jugador
            })
        } else {
            console.log("❌ Login fallido - Usuario o contraseña incorrectos");
            res.send({ validar: false })
        }
    } catch (error) {
        console.log("❌ Error al buscar usuario:", error);
        res.status(500).send({ error: "No se pudo buscar el usuario" });
    }
});

// REGISTRO
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

// CLIENTES PEDIDO
app.get('/clientesPedido', async function (req, res) {
    try {
        const result = await realizarQuery(
            `SELECT nombre, pedido FROM Clientes ORDER BY RAND() LIMIT 1`
        );

        if (result.length === 0) {
            return res.status(404).json({
                error: 'No hay clientes disponibles'
            });
        }

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

// SOCKET.IO
io.on("connection", (socket) => {
    console.log('🔌 Usuario conectado:', socket.id);

    // CREAR SALA
    socket.on("createRoom", async (data) => {
        try {
            console.log("📥 createRoom - Datos recibidos:", JSON.stringify(data, null, 2));
            
            const { id_jugador } = data;

            // Validar que llegó el ID
            if (!id_jugador) {
                console.error("❌ createRoom - No se recibió id_jugador");
                socket.emit("errorRoom", "ID de jugador no válido");
                return;
            }

            console.log("🔍 createRoom - Buscando jugador con ID:", id_jugador);

            // Verificar que el jugador existe
            const jugadorExiste = await realizarQuery(`
                SELECT * FROM Jugadores WHERE id_jugador = ${id_jugador}
            `);

            if (jugadorExiste.length === 0) {
                console.error("❌ createRoom - Jugador no encontrado en BD");
                socket.emit("errorRoom", "Jugador no encontrado");
                return;
            }

            // Generar código único para la sala
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            console.log("🎲 createRoom - Código generado:", code);

            // Crear la sala
            const queryRoom = `INSERT INTO Juegos (code) VALUES ('${code}')`;
            const result = await realizarQuery(queryRoom);
            const id_juego = result.insertId;

            // Insertar al host en la sala
            const queryJugador = `
                INSERT INTO JugadoresJuego (id_jugador, id_juego, id_result)
                VALUES (${id_jugador}, ${id_juego}, NULL)
            `;
            await realizarQuery(queryJugador);

            // Unir al socket a la sala
            socket.join(code);

            // Obtener jugadores en la sala
            const jugadores = await realizarQuery(`
                SELECT
                    j.id_jugador,
                    j.nombre_usuario,
                    CASE 
                        WHEN jj.id_jugador = (
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

            io.to(code).emit("updateJugadores", jugadores);
            socket.emit("roomCreated", { code, id_game: id_juego });

        } catch (err) {
            console.error("❌ createRoom - Error:", err);
            socket.emit("errorRoom", "No se pudo crear la sala");
        }
    });

    // UNIRSE A SALA
    socket.on("joinRoom", async (data) => {
        try {
            const { code, id_jugador } = data;

            if (!code || !id_jugador) {
                console.error("❌ joinRoom - Datos incompletos");
                socket.emit("errorRoom", "Datos incompletos");
                return;
            }

            // Verificar si la sala existe
            const sala = await realizarQuery(`
                SELECT id_juego FROM Juegos WHERE code = '${code}'
            `);

            if (sala.length === 0) {
                console.error("❌ joinRoom - Sala no encontrada");
                socket.emit("errorRoom", "La sala no existe");
                return;
            }

            const id_juego = sala[0].id_juego;

            // Verificar si la sala tiene espacio
            const jugadoresActuales = await realizarQuery(`
                SELECT COUNT(*) as total FROM JugadoresJuego WHERE id_juego = ${id_juego}
            `);

            if (jugadoresActuales[0].total >= 2) {
                console.error("❌ joinRoom - Sala llena");
                socket.emit("errorRoom", "La sala está llena");
                return;
            }

            // Verificar si el jugador ya está en la sala
            const yaEnSala = await realizarQuery(`
                SELECT * FROM JugadoresJuego WHERE id_juego = ${id_juego} AND id_jugador = ${id_jugador}
            `);

            if (yaEnSala.length > 0) {
                console.error("❌ joinRoom - Ya estás en esta sala");
                socket.emit("errorRoom", "Ya estás en esta sala");
                return;
            }

            // Insertar el jugador en la sala
            const queryJugador = `
                INSERT INTO JugadoresJuego (id_jugador, id_juego, id_result)
                VALUES (${id_jugador}, ${id_juego}, NULL)
            `;
            await realizarQuery(queryJugador);

            // Unir al socket
            socket.join(code);

            // Obtener jugadores actualizados
            const jugadores = await realizarQuery(`
                SELECT
                    j.id_jugador,
                    j.nombre_usuario,
                    CASE 
                        WHEN jj.id_jugador = (
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

            io.to(code).emit("updateJugadores", jugadores);
            socket.emit("roomJoined", { code, id_game: id_juego });

        } catch (err) {
            console.error("❌ joinRoom - Error:", err);
            socket.emit("errorRoom", "No se pudo unir a la sala");
        }
    });

    // DESCONEXIÓN
    socket.on("disconnect", () => {
        console.log("🔌 Usuario desconectado:", socket.id);
    });
});
