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
  const [mostrarReglas, setMostrarReglas] = useState(false)
  const { socket, isConnected } = useSocket()
  const [codigo, setCodigo] = useState("")
  const [inLobby, setInLobby] = useState(false)
  const [jugadores, setJugadores] = useState([])
  const [userId, setUserId] = useState(null)

  // Estados para los popups
  const [isPopUpGameOpen, setIsPopUpGameOpen] = useState(false)
  const [isCreateRoomOpen, setCreateRoomOpen] = useState(false)
  const [isJoinRoomOpen, setJoinRoomOpen] = useState(false)

  // Obtener el userId del sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem("jugadorId") // ← CORREGIDO
    if (id) {
      setUserId(parseInt(id))
    }
  }, [])

  // Configurar listeners de socket
  useEffect(() => {
    if (!socket) return

    socket.on("updateJugadores", (jugadores) => { // ← YA ESTÁ BIEN
      console.log("Actualización de jugadores recibida")
      console.log("Jugadores actuales:", jugadores)
      setJugadores(jugadores)
    })

    socket.on("gameStart", (data) => {
      console.log("Recibido gameStart con code:", data.code)
      router.push(`/Juego?code=${data.code}`)
    })

    socket.on("roomCreated", (data) => {
      console.log("Sala creada con código:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setCreateRoomOpen(false)
    })

    socket.on("roomJoined", (data) => {
      console.log("Unido a sala:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setJoinRoomOpen(false)
    })

    socket.on("errorRoom", (msg) => {
      alert("Error: " + msg)
    })

    return () => {
      socket.off("updateJugadores") // ← YA ESTÁ BIEN
      socket.off("gameStart")
      socket.off("roomCreated")
      socket.off("roomJoined")
      socket.off("errorRoom")
    }
  }, [socket, router])

  const handleJugar = () => {
    setIsPopUpGameOpen(true)
  }

  const toggleReglas = () => {
    setMostrarReglas(!mostrarReglas)
  }

  // Funciones para crear y unirse a salas
  function createRoom() {
    console.log("Crear sala")

    const id_jugador = sessionStorage.getItem("jugadorId") // ← CORREGIDO

    if (!id_jugador) {
      alert("No se encontró el ID del jugador")
      return
    }

    socket.emit("createRoom", { id_jugador: parseInt(id_jugador) })
  }

  function joinRoom() {
    console.log("Unirse a sala:", codigo)

    const id_jugador = sessionStorage.getItem("jugadorId") // ← CORREGIDO

    if (!id_jugador) {
      alert("No se encontró el ID del jugador")
      return
    }

    if (!codigo || codigo.trim() === "") {
      alert("Por favor ingresa un código de sala")
      return
    }

    socket.emit("joinRoom", {
      code: codigo.trim().toUpperCase(),
      id_jugador: parseInt(id_jugador)
    })
  }

  // Funciones para manejar popups
  function showCreateRoom() {
    setIsPopUpGameOpen(false)
    setCreateRoomOpen(true)
  }

  function showJoinRoom() {
    setIsPopUpGameOpen(false)
    setJoinRoomOpen(true)
  }

  const closePopupGame = () => setIsPopUpGameOpen(false)
  const closeCreateRoom = () => setCreateRoomOpen(false)
  const closeJoinRoom = () => setJoinRoomOpen(false)

  // Si está en el lobby, mostrar el componente Lobby
  if (inLobby) {
    return (
      <Lobby
        codigo={codigo}
        socket={socket}
        jugadores={jugadores}
      />
    )
  }

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
          <button className={styles.juegoButton} onClick={handleJugar}>
            JUGAR
          </button>
          <button className={styles.juegoButton} onClick={toggleReglas}>
            REGLAS DEL JUEGO
          </button>
        </div>
      </div>

      {mostrarReglas && (
        <div className={styles.modalOverlay} onClick={toggleReglas}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>¡Bienvenido!</h2>
            <p className={styles.modalText}>
              ¡Prepárate para el desafío más sabroso! 🍔🎮 Tu misión es preparar y entregar hamburguesas perfectas para ganar puntos. 
              Los pedidos serán cada vez más rápidos y complicados, ¡así que tendrás que ser veloz y preciso! Cuanto más rápido entregues y más acertado seas,
              ¡más subirás en el ranking! 📈🌍
              Al final de cada jornada, verás tu puntaje y tu posición.
              ¡Corre contra el reloj y demuestra que eres el Master Burger Chef del mundo! 👑
            </p>
            <button className={styles.closeButton} onClick={toggleReglas}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Popup principal para elegir crear o unirse */}
      <Popup
        open={isPopUpGameOpen}
        onClose={closePopupGame}
        modal
        nested
        closeOnDocumentClick={false}
      >
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2>Jugar</h2>
          </div>
          <div className={styles.content}>
            <button onClick={showCreateRoom} className={styles.joinBtn}>
              Crear una sala
            </button>
            <button onClick={showJoinRoom} className={styles.joinBtn}>
              Unirse a una sala
            </button>
          </div>
          <div className={styles.actions}>
            <button onClick={closePopupGame} className={styles.cancelBtn}>
              Cerrar
            </button>
          </div>
        </div>
      </Popup>

      {/* Popup para crear sala */}
      <Popup
        open={isCreateRoomOpen}
        onClose={closeCreateRoom}
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
            <button onClick={closeCreateRoom} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>

      {/* Popup para unirse a sala */}
      <Popup
        open={isJoinRoomOpen}
        onClose={closeJoinRoom}
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
            <button onClick={closeJoinRoom} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      </Popup>
    </div>
  )
}