"use client";

import { useEffect } from "react";
import Button from "./Button";
import styles from "./lobby.module.css";

export default function Lobby({ codigo, jugadores = [], socket }) {
  // Obtener userId directamente del sessionStorage
  const userId = typeof window !== 'undefined' 
    ? parseInt(sessionStorage.getItem("playerId")) 
    : null;

  useEffect(() => {
    console.log("=== DEBUG LOBBY ===");
    console.log("Jugadores en Lobby:", JSON.stringify(jugadores, null, 2));
    console.log("Mi userId:", userId);
    console.log("Tipo de userId:", typeof userId);
    console.log("==================");
  }, [jugadores, userId]);

  // Verificar si soy el host
  const soyHost = jugadores.length > 0 && jugadores.some(
    (jug) => Number(jug.id_jugador) === Number(userId) && Number(jug.esHost) === 1
  );

  // Verificar conexión del socket
  const isConnected = socket?.connected || false;

  function onStartGame() {
    if (!socket || !isConnected) {
      console.error("❌ Socket no conectado");
      alert("Error: No hay conexión con el servidor");
      return;
    }

    if (jugadores.length < 2) {
      alert("Se necesitan 2 jugadores para iniciar");
      return;
    }

    console.log("🎮 Iniciando juego...");
    socket.emit("startGame", { code: codigo });
  }

  // Validación por si no hay jugadores
  if (!jugadores || jugadores.length === 0) {
    return (
      <div className={styles.lobbyContainer}>
        <div className={styles.roomCodeBox}>
          Código de sala: <span>{codigo}</span>
        </div>
        <div className={styles.players}>
          <div className={styles.emptySlot}>Cargando jugadores...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lobbyContainer}>
      {/* Caja elegante con el código */}
      <div className={styles.roomCodeBox}>
        Código de sala: <span>{codigo}</span>
      </div>

      <div className={styles.players}>
        {jugadores.map((jug) => (
          <div key={jug.id_jugador} className={styles.playerCard}>
            {/* Iniciales en lugar de avatar */}
            <div className={styles.avatarPlaceholder}>
              {jug.nombre_usuario ? jug.nombre_usuario.charAt(0).toUpperCase() : "?"}
            </div>

            <h3 className={styles.playerName}>{jug.nombre_usuario}</h3>

            {/* Si es el host */}
            {Boolean(jug.esHost) && (
              <p className={styles.hostTag}>👑 Host</p>
            )}

            {/* Indicador de que soy yo */}
            {Number(jug.id_jugador) === Number(userId) && (
              <p className={styles.ready}>Tú</p>
            )}
          </div>
        ))}

        {/* Si hay menos de 2 jugadores, mostrar slot vacío */}
        {jugadores.length < 2 && (
          <div className={styles.emptySlot}>
            <p>Esperando jugador...</p>
            <p className={styles.codeHint}>
              Comparte el código: <strong>{codigo}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Botón visible solo para el host cuando hay 2 jugadores */}
      {soyHost && jugadores.length === 2 && (
        <Button page="lobby" onClick={onStartGame} text="Iniciar Juego" />
      )}

      {/* Mensaje para jugadores que no son host */}
      {!soyHost && jugadores.length === 2 && (
        <p className={styles.waitingMessage}>
          Esperando que el host inicie el juego...
        </p>
      )}

      {/* Indicador de conexión */}
      {!isConnected && (
        <div className={styles.connectionWarning}>
          ⚠️ Reconectando al servidor...
        </div>
      )}
    </div>
  );
}