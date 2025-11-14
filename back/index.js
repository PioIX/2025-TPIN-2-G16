var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
const session = require("express-session");
const { realizarQuery } = require('./modulos/mysql');
const sesionesActivas = new Map();

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

app.post('/loginUsuario', async function (req, res) {
    console.log("Login - Datos recibidos:", req.body);
    try {
        const result = await realizarQuery(`
            SELECT * FROM Jugadores WHERE nombre_usuario = "${req.body.nombre_usuario}" AND contraseña = "${req.body.contraseña}";
        `);

        console.log("Resultado de la query:", result);

        if (result.length > 0) {
            console.log("Login exitoso - ID del jugador:", result[0].id_jugador);
            res.send({
                validar: true,
                id: result[0].id_jugador,
                administrador: result[0].administrador 
            })
        } else {
            console.log("Login fallido - Usuario o contraseña incorrectos");
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

app.get('/admin/jugadores', async function (req, res) {
    try {
        const result = await realizarQuery(`SELECT * FROM Jugadores;`);
        res.send({ success: true, jugadores: result });
    } catch (error) {
        console.log("Error al obtener usuarios:", error);
        res.status(500).send({ error: "No se pudieron obtener los usuarios" });
    }
});

app.put('/admin/jugadores/:id', async function (req, res) {
    const { id } = req.params;
    const { nombre_usuario, email, contraseña, administrador } = req.body;
    
    try {
        const result = await realizarQuery(`
            UPDATE Jugadores 
            SET nombre_usuario = "${nombre_usuario}", 
                email = "${email}", 
                contraseña = "${contraseña}", 
                administrador = ${administrador}
            WHERE id_jugador = ${id};
        `);
        res.send({ success: true, message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.log("Error al actualizar usuario:", error);
        res.status(500).send({ error: "No se pudo actualizar el usuario" });
    }
});

io.on("connection", async (socket) => {
    console.log('🔌 Usuario conectado:', socket.id);

    
    const jugadorId = socket.handshake.query.jugadorId;
    console.log("Verificando jugador:", jugadorId);

    if (!jugadorId || jugadorId === "null" || jugadorId === "undefined") {
        console.error("Conexión rechazada: No hay jugadorId");
        socket.emit("errorAuth", "Debes iniciar sesión primero");
        socket.disconnect();
        return;
    }

    try {
        const jugadorExiste = await realizarQuery(`
            SELECT * FROM Jugadores WHERE id_jugador = ${jugadorId}
        `);

        if (jugadorExiste.length === 0) {
            console.error("Jugador no encontrado en BD:", jugadorId);
            socket.emit("errorAuth", "Usuario no válido");
            socket.disconnect();
            return;
        }

        sesionesActivas.set(socket.id, parseInt(jugadorId));
        console.log("Sesión autenticada:", socket.id, "-> Jugador ID:", jugadorId);

        socket.emit("authenticated", {
            jugadorId: parseInt(jugadorId),
            nombre: jugadorExiste[0].nombre_usuario
        });

    } catch (err) {
        console.error(" Error verificando jugador:", err);
        socket.emit("errorAuth", "Error de autenticación");
        socket.disconnect();
        return;
    }

    
    socket.on("createRoom", async () => {
        try {
            const id_jugador = sesionesActivas.get(socket.id);

            if (!id_jugador) {
                console.error("createRoom - No hay sesión activa");
                socket.emit("errorRoom", "Debes iniciar sesión primero");
                return;
            }

            console.log("createRoom - Jugador ID:", id_jugador);

            const codigo = Math.random().toString(36).substring(2, 8).toUpperCase();
            console.log("🎲 createRoom - Código generado:", codigo);

            
            const queryRoom = `INSERT INTO Juegos (codigo) VALUES ('${codigo}')`;
            const result = await realizarQuery(queryRoom);
            const id_juegos = result.insertId;

            console.log("createRoom - id_juegos insertado:", id_juegos);

            
            const queryJugador = `
                INSERT INTO JugadoresJuego (id_jugador, id_juegos, id_resultado)
                VALUES (${id_jugador}, ${id_juegos}, NULL)
            `;
            await realizarQuery(queryJugador);

            console.log("createRoom - Jugador insertado como HOST");

            
            socket.join(codigo);
            console.log("createRoom - Socket unido a sala:", codigo);

            
            const jugadores = await realizarQuery(`
                SELECT 
                    j.id_jugador,
                    j.nombre_usuario,
                    CASE 
                        WHEN jj.id_jugadorjuego = (
                            SELECT MIN(id_jugadorjuego) 
                            FROM JugadoresJuego 
                            WHERE id_juegos = ${id_juegos}
                        ) THEN 1 ELSE 0 
                    END AS esHost
                FROM JugadoresJuego jj
                JOIN Jugadores j ON jj.id_jugador = j.id_jugador
                WHERE jj.id_juegos = ${id_juegos}
                ORDER BY jj.id_jugadorjuego ASC
            `);

            console.log("DEBUG - Jugadores que se van a emitir:");
            console.log("- Cantidad:", jugadores.length);
            console.log("- Contenido:", JSON.stringify(jugadores, null, 2));
            console.log("- Código de sala:", codigo);

            
            socket.emit("roomCreated", { code: codigo, id_juegos });
            io.to(codigo).emit("updateJugadores", jugadores);

            console.log("createRoom - Eventos emitidos correctamente");

        } catch (err) {
            console.error("createRoom - Error:", err);
            socket.emit("errorRoom", "No se pudo crear la sala");
        }
    });

    
    socket.on("joinRoom", async (data) => {
        try {
            const { code } = data;
            const id_jugador = sesionesActivas.get(socket.id);

            if (!id_jugador) {
                console.error("joinRoom - No hay sesión activa");
                socket.emit("errorRoom", "Debes iniciar sesión primero");
                return;
            }

            if (!code) {
                console.error("joinRoom - No se recibió código");
                socket.emit("errorRoom", "Código de sala requerido");
                return;
            }

            console.log("joinRoom - Jugador:", id_jugador, "Código:", code);

            
            const sala = await realizarQuery(`
                SELECT id_juegos FROM Juegos WHERE codigo = '${code}'
            `);

            if (sala.length === 0) {
                console.error("joinRoom - Sala no encontrada");
                socket.emit("errorRoom", "La sala no existe");
                return;
            }

            const id_juegos = sala[0].id_juegos;

           
            const jugadoresActuales = await realizarQuery(`
                SELECT COUNT(*) as total FROM JugadoresJuego WHERE id_juegos = ${id_juegos}
            `);

            if (jugadoresActuales[0].total >= 2) {
                console.error("joinRoom - Sala llena");
                socket.emit("errorRoom", "La sala está llena");
                return;
            }

            
            const yaEnSala = await realizarQuery(`
                SELECT * FROM JugadoresJuego 
                WHERE id_juegos = ${id_juegos} AND id_jugador = ${id_jugador}
            `);

            if (yaEnSala.length > 0) {
                console.error("joinRoom - Ya estás en esta sala");
                socket.emit("errorRoom", "Ya estás en esta sala");
                return;
            }

            
            const queryJugador = `
                INSERT INTO JugadoresJuego (id_jugador, id_juegos, id_resultado)
                VALUES (${id_jugador}, ${id_juegos}, NULL)
            `;
            await realizarQuery(queryJugador);

            
            socket.join(code);
            console.log("joinRoom - Socket unido a sala:", code);

           
            const jugadores = await realizarQuery(`
                SELECT 
                    j.id_jugador,
                    j.nombre_usuario,
                    CASE 
                        WHEN jj.id_jugadorjuego = (
                            SELECT MIN(id_jugadorjuego) 
                            FROM JugadoresJuego 
                            WHERE id_juegos = ${id_juegos}
                        ) THEN 1 ELSE 0 
                    END AS esHost
                FROM JugadoresJuego jj
                JOIN Jugadores j ON jj.id_jugador = j.id_jugador
                WHERE jj.id_juegos = ${id_juegos}
                ORDER BY jj.id_jugadorjuego ASC
            `);

            console.log("👥 joinRoom - Jugadores en sala:", jugadores);

            // Emitir eventos
            socket.emit("roomJoined", { code: code, id_juegos });
            io.to(code).emit("updateJugadores", jugadores);

            console.log("joinRoom - Eventos emitidos correctamente");

        } catch (err) {
            console.error("joinRoom - Error:", err);
            socket.emit("errorRoom", "No se pudo unir a la sala");
        }
    });

   
    socket.on("startGame", async (data) => {
        try {
            const { code } = data;
            const id_jugador = sesionesActivas.get(socket.id);

            console.log("startGame - Código:", code, "Jugador:", id_jugador);

            if (!code) {
                console.error("startGame - No se recibió código");
                socket.emit("errorRoom", "Código de sala requerido");
                return;
            }

            const sala = await realizarQuery(`
                SELECT id_juegos FROM Juegos WHERE codigo = '${code}'
            `);

            if (sala.length === 0) {
                console.error("startGame - Sala no encontrada");
                socket.emit("errorRoom", "La sala no existe");
                return;
            }

            const id_juegos = sala[0].id_juegos;

            const jugadoresEnSala = await realizarQuery(`
                SELECT COUNT(*) as total FROM JugadoresJuego WHERE id_juegos = ${id_juegos}
            `);

            if (jugadoresEnSala[0].total < 2) {
                console.error("startGame - Faltan jugadores");
                socket.emit("errorRoom", "Se necesitan 2 jugadores para iniciar");
                return;
            }

            const hostQuery = await realizarQuery(`
                SELECT id_jugador 
                FROM JugadoresJuego 
                WHERE id_juegos = ${id_juegos} 
                ORDER BY id_jugadorjuego ASC 
                LIMIT 1
            `);

            if (hostQuery.length === 0 || hostQuery[0].id_jugador !== id_jugador) {
                console.error("startGame - Solo el host puede iniciar");
                console.log("Host esperado:", hostQuery[0]?.id_jugador, "Recibido:", id_jugador);
                socket.emit("errorRoom", "Solo el host puede iniciar el juego");
                return;
            }

            console.log("startGame - Host verificado, iniciando juego");


            io.to(code).emit("gameStart", {
                code: code,
                id_juegos: id_juegos
            });

            console.log("startGame - Juego iniciado en sala:", code);

        } catch (err) {
            console.error("startGame - Error:", err);
            socket.emit("errorRoom", "No se pudo iniciar el juego");
        }
    });

   
    socket.on("disconnect", () => {
        const jugadorId = sesionesActivas.get(socket.id);
        console.log("🔌 Usuario desconectado:", socket.id, "Jugador:", jugadorId);
        sesionesActivas.delete(socket.id);
    });
});