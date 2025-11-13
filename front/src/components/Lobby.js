'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Lobby.module.css'

export default function Lobby({ codigo, socket, jugadores }) {
  const router = useRouter()
  const [miId, setMiId] = useState(null)
  const [esHost, setEsHost] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Obtener el ID del jugador al cargar
  useEffect(() => {
    const jugadorId = sessionStorage.getItem("jugadorId")
    console.log("🎮 LOBBY - Mi ID:", jugadorId)
    if (jugadorId) {
      setMiId(parseInt(jugadorId))
    }
  }, [])

  // Verificar si soy el host
  useEffect(() => {
    console.log("🔍 LOBBY - Verificando host. Mi ID:", miId, "Jugadores:", jugadores)
    
    if (miId && jugadores.length > 0) {
      const yo = jugadores.find(j => j.id_jugador === miId)
      console.log("👤 LOBBY - Yo soy:", yo)
      
      if (yo) {
        const soyHost = yo.esHost === 1
        setEsHost(soyHost)
        console.log(soyHost ? "👑 LOBBY - SOY EL HOST" : "👥 LOBBY - No soy el host")
      }
    }
  }, [miId, jugadores])

  // Listener para cuando el juego inicia
  useEffect(() => {
    if (!socket) return

    const handleGameStart = (data) => {
      console.log("🎮 LOBBY - ¡JUEGO INICIADO! Redirigiendo a /Juego con código:", data.code)
      router.push(`/Juego?code=${data.code}`)
    }

    socket.on("gameStart", handleGameStart)

    return () => {
      socket.off("gameStart", handleGameStart)
    }
  }, [socket, router])

  // Función para iniciar el juego
  const iniciarJuego = () => {
    console.log("🚀 LOBBY - Intentando iniciar juego...")
    console.log("🔍 LOBBY - ¿Soy host?:", esHost)
    console.log("🔍 LOBBY - Jugadores:", jugadores.length)
    
    if (!esHost) {
      alert("Solo el host puede iniciar el juego")
      return
    }

    if (jugadores.length < 2) {
      alert("Se necesitan 2 jugadores para iniciar")
      return
    }

    if (socket) {
      console.log("📤 LOBBY - Emitiendo startGame con código:", codigo)
      socket.emit("startGame", { code: codigo })
    } else {
      console.error("❌ LOBBY - No hay socket disponible")
    }
  }

  // Función para copiar código
  const copiarCodigo = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      alert("Código copiado: " + codigo)
    }
  }

  console.log("🖼️ LOBBY - Renderizando. Jugadores:", jugadores.length, "esHost:", esHost)

  return (
    <div className={styles.lobbyContainer}>
      <div className={styles.lobbyCard}>
        <h1 className={styles.title}>Sala de Espera</h1>
        
        <div className={styles.codigoContainer}>
          <p className={styles.codigoLabel}>Código de sala:</p>
          <div className={styles.codigoBox}>
            <span className={styles.codigo}>{codigo}</span>
            <button 
              onClick={copiarCodigo}
              className={`${styles.copyBtn} ${copiado ? styles.copied : ''}`}
            >
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
          <p className={styles.shareText}>Comparte este código con tu amigo</p>
        </div>

        <div className={styles.jugadoresContainer}>
          <h2 className={styles.subtitle}>Jugadores ({jugadores.length}/2)</h2>
          <div className={styles.jugadoresList}>
            {jugadores.map((jugador) => (
              <div key={jugador.id_jugador} className={styles.jugadorItem}>
                <span className={styles.jugadorNombre}>
                  {jugador.nombre_usuario}
                </span>
                {jugador.esHost === 1 && (
                  <span className={styles.hostBadge}>👑 Host</span>
                )}
                {jugador.id_jugador === miId && (
                  <span className={styles.youBadge}>(Tú)</span>
                )}
              </div>
            ))}
            
            {/* Mostrar slots vacíos */}
            {jugadores.length < 2 && (
              <div className={`${styles.jugadorItem} ${styles.emptySlot}`}>
                <span className={styles.jugadorNombre}>Esperando jugador...</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          {esHost ? (
            <button 
              onClick={iniciarJuego} 
              className={styles.startBtn}
              disabled={jugadores.length < 2}
            >
              {jugadores.length < 2 ? '⏳ Esperando jugadores...' : '🎮 Iniciar Juego'}
            </button>
          ) : (
            <p className={styles.waitingText}>
              ⏳ Esperando a que el host inicie el juego...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}