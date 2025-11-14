import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useSocket = (options = {}, serverUrl = "http://localhost:4000") => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    
    const jugadorId = sessionStorage.getItem("jugadorId");
    
    if (!jugadorId || jugadorId === "null" || jugadorId === "undefined") {
      console.error(" useSocket - No hay jugadorId válido");
      return;
    }

    console.log("🔌 useSocket - Conectando con jugadorId:", jugadorId);

    
    const socketIo = io(serverUrl, {
      ...options,
      query: {
        jugadorId: jugadorId
      },
      transports: ['websocket', 'polling'],
      reconnection: true
    });

    
    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket conectado:', socketIo.id);
      console.log('Autenticado como jugador:', jugadorId);
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket desconectado');
    });

    socketIo.on('connect_error', (err) => {
      console.error('Error de conexión:', err);
    });

    setSocket(socketIo);

    
    return () => {
      socketIo.disconnect();
    };
  }, [serverUrl, JSON.stringify(options)]);

  return { socket, isConnected };
};

export { useSocket };