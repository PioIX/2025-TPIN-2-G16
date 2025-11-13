import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';

const useConnection = (serverUrl = "http://localhost:4000") => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [roomCode, setRoomCode] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);

    useEffect(() => {
        // Crear conexión con el backend
        const socketIo = io(serverUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        // Eventos de conexión
        socketIo.on('connect', () => {
            setIsConnected(true);
            setError(null);
            console.log('✅ WebSocket conectado:', socketIo.id);
        });

        socketIo.on('disconnect', () => {
            setIsConnected(false);
            console.log('❌ WebSocket desconectado');
        });

        socketIo.on('connect_error', (err) => {
            setError(`Error de conexión: ${err.message}`);
            console.error('Error de conexión:', err);
        });

        // Eventos de sala
        socketIo.on('roomCreated', (data) => {
            console.log('🎉 Sala creada:', data);
            setRoomCode(data.code);
            setError(null);
        });

        socketIo.on('roomJoined', (data) => {
            console.log('🎉 Te uniste a la sala:', data);
            setRoomCode(data.code);
            setError(null);
        });

        socketIo.on('updateJugadores', (jugadoresData) => {
            console.log('👥 Jugadores actualizados:', jugadoresData);
            setJugadores(jugadoresData);
        });

        socketIo.on('gameStart', (data) => {
            console.log('🎮 ¡Juego iniciado!', data);
            setGameStarted(true);
        });

        socketIo.on('errorRoom', (errorMsg) => {
            console.error('❌ Error de sala:', errorMsg);
            setError(errorMsg);
        });

        setSocket(socketIo);

        // Limpiar al desmontar
        return () => {
            socketIo.disconnect();
        };
    }, [serverUrl]);

    // Funciones para interactuar con el socket
    const createRoom = useCallback((id_jugador) => {
        if (socket && isConnected) {
            console.log('📤 Creando sala para jugador:', id_jugador);
            socket.emit('createRoom', { id_jugador });
        } else {
            setError('No hay conexión con el servidor');
        }
    }, [socket, isConnected]);

    const joinRoom = useCallback((code, id_jugador) => {
        if (socket && isConnected) {
            console.log('📤 Uniéndose a sala:', code, 'Jugador:', id_jugador);
            socket.emit('joinRoom', { code, id_jugador });
        } else {
            setError('No hay conexión con el servidor');
        }
    }, [socket, isConnected]);

    const startGame = useCallback((code) => {
        if (socket && isConnected) {
            console.log('📤 Iniciando juego en sala:', code);
            socket.emit('startGame', { code });
        } else {
            setError('No hay conexión con el servidor');
        }
    }, [socket, isConnected]);

    const resetRoom = useCallback(() => {
        setRoomCode(null);
        setJugadores([]);
        setGameStarted(false);
        setError(null);
    }, []);

    return {
        socket,
        isConnected,
        error,
        roomCode,
        jugadores,
        gameStarted,
        createRoom,
        joinRoom,
        startGame,
        resetRoom
    };
};

export default useConnection;