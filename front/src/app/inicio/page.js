'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'
import { useSocket } from '@/hooks/useSocket'
import Popup from 'reactjs-popup'
import Lobby from '@/components/Lobby'

export default function MenuPrincipal() {
  const router = useRouter()
  const { socket } = useSocket()
  
  // Estados principales
  const [mostrarReglas, setMostrarReglas] = useState(false)
  const [codigo, setCodigo] = useState("")
  const [inLobby, setInLobby] = useState(false)
  const [jugadores, setJugadores] = useState([])
  
  // Estados para popups
  const [isPopUpGameOpen, setIsPopUpGameOpen] = useState(false)
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false)
  const [isJoinRoomOpen, setJoinRoomOpen] = useState(false)

  // Configurar listeners de socket
  useEffect(() => {
    if (!socket) return

    const handleUpdateJugadores = (jugadores) => {
      console.log("Jugadores actualizados:", jugadores)
      setJugadores(jugadores)
    }

    const handleGameStart = (data) => {
      console.log("Juego iniciado:", data.code)
      router.push(`/Juego?code=${data.code}`)
    }

    const handleRoomCreated = (data) => {
      console.log("Sala creada:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setCreateRoomOpen(false)
    }

    const handleRoomJoined = (data) => {
      console.log("Te uniste a la sala:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setJoinRoomOpen(false)
    }

    const handleErrorRoom = (msg) => {
      alert("Error: " + msg)
    }

    socket.on("updateJugadores", handleUpdateJugadores)
    socket.on("gameStart", handleGameStart)
    socket.on("roomCreated", handleRoomCreated)
    socket.on("roomJoined", handleRoomJoined)
    socket.on("errorRoom", handleErrorRoom)

    return () => {
      socket.off("updateJugadores", handleUpdateJugadores)
      socket.off("gameStart", handleGameStart)
      socket.off("roomCreated", handleRoomCreated)
      socket.off("roomJoined", handleRoomJoined)
      socket.off("errorRoom", handleErrorRoom)
    }
  }, [socket, router])

  // Función para crear sala
  const createRoom = () => {
    const id_jugador = sessionStorage.getItem("jugadorId")
    console.log("Creando sala con jugador ID:", id_jugador)

    if (!id_jugador) {
      alert("No se encontró el ID del jugador. Por favor recarga la página.")
      return
    }

    if (!socket) {
      alert("No hay conexión con el servidor")
      return
    }

    socket.emit("createRoom", { id_jugador: parseInt(id_jugador) })
  }

  // Función para unirse a sala
  const joinRoom = () => {
    const id_jugador = sessionStorage.getItem("jugadorId")
    console.log("Uniéndose a sala con jugador ID:", id_jugador)

    if (!id_jugador) {
      alert("No se encontró el ID del jugador. Por favor recarga la página.")
      return
    }

    if (!codigo || codigo.trim() === "") {
      alert("Por favor ingresa un código de sala")
      return
    }

    if (!socket) {
      alert("No hay conexión con el servidor")
      return
    }

    socket.emit("joinRoom", {
      code: codigo.trim().toUpperCase(),
      id_jugador: parseInt(id_jugador)
    })
  }

  // Si está en el lobby, mostrar componente Lobby
  if (inLobby) {
    return (
      <Lobby
        codigo={codigo}
        socket={socket}
        jugadores={jugadores}
      />
    )
  }

  // Renderizar menú principal
  return (
    <div className={styles.menuContainer}>
      <div className={styles.backgroundImage}>
        <Image
          src="/imagenesFondo/inicio.png"
          alt="Fondo restaurante"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.buttonsContainer}>
          <button className={styles.juegoButton} onClick={() => setIsPopUpGameOpen(true)}>
            JUGAR
          </button>
          <button className={styles.juegoButton} onClick={() => setMostrarReglas(!mostrarReglas)}>
            REGLAS DEL JUEGO
          </button>
        </div>
      </div>

      {/* Modal de reglas */}
      {mostrarReglas && (
        <div className={styles.modalOverlay} onClick={() => setMostrarReglas(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>¡Bienvenido!</h2>
            <p className={styles.modalText}>
              ¡Prepárate para el desafío más sabroso! 🍔🎮 Tu misión es preparar y entregar hamburguesas perfectas para ganar puntos. 
              Los pedidos serán cada vez más rápidos y complicados, ¡así que tendrás que ser veloz y preciso! Cuanto más rápido entregues y más acertado seas,
              ¡más subirás en el ranking! 📈🌍
              Al final de cada jornada, verás tu puntaje y tu posición.
              ¡Corre contra el reloj y demuestra que eres el Master Burger Chef del mundo! 👑
            </p>
            <button className={styles.closeButton} onClick={() => setMostrarReglas(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Popup: elegir crear o unirse */}
      <Popup
        open={isPopUpGameOpen}
        onClose={() => setIsPopUpGameOpen(false)}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Jugar</h2>
          </div>
          <div className={styles.content}>
            <button 
              onClick={() => {
                setIsPopUpGameOpen(false)
                setCreateRoomOpen(true)
              }} 
              className={styles.joinBtn}
            >
              Crear una sala
            </button>
            <button 
              onClick={() => {
                setIsPopUpGameOpen(false)
                setJoinRoomOpen(true)
              }} 
              className={styles.joinBtn}
            >
              Unirse a una sala
            </button>
          </div>
          <div className={styles.actions}>
            <button onClick={() => setIsPopUpGameOpen(false)} className={styles.cancelBtn}>
              Cerrar
            </button>
          </div>
        </div>
      </Popup>

      {/* Popup: crear sala */}
      <Popup
        open={isCreateRoomOpen}
        onClose={() => setCreateRoomOpen(false)}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Crear una Sala</h2>
          </div>
          <div className={styles.content}>
            <p>Presiona crear para generar una nueva sala de juego.</p>
          </div>
          <div className={styles.actions}>
            <button onClick={createRoom} className={styles.createBtn}>
              Crear
            </button>
            <button onClick={() => setCreateRoomOpen(false)} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>

      {/* Popup: unirse a sala */}
      <Popup
        open={isJoinRoomOpen}
        onClose={() => setJoinRoomOpen(false)}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Unirse a una Sala</h2>
          </div>
          <div className={styles.content}>
            <p>Escribe el código de la sala:</p>
            <input
              type="text"
              placeholder="ABC123..."
              className={styles.input}
              onChange={(e) => setCodigo(e.target.value)}
              value={codigo}
            />
          </div>
          <div className={styles.actions}>
            <button onClick={joinRoom} className={styles.createBtn}>
              Unirse
            </button>
            <button onClick={() => setJoinRoomOpen(false)} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>
    </div>
  )
}