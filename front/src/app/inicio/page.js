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

  // VERIFICAR ID DEL JUGADOR AL CARGAR
  useEffect(() => {
    const jugadorId = sessionStorage.getItem("jugadorId")
    console.log("MENU - Verificando jugadorId:", jugadorId)

    if (!jugadorId || jugadorId === "null" || jugadorId === "undefined") {
      console.error("MENU - No hay jugadorId válido, redirigiendo a login")
      alert("No hay sesión activa. Por favor inicia sesión.")
      router.push('/')
      return
    }

    console.log("MENU - jugadorId válido:", jugadorId)
  }, [router])

  // Configurar listeners de socket
  useEffect(() => {
    if (!socket) {
      console.log("MENU - Esperando conexión de socket...")
      return
    }

    console.log("MENU - Socket conectado, configurando listeners")

    const handleUpdateJugadores = (jugadoresActualizados) => {
      console.log("MENU - Jugadores actualizados:", jugadoresActualizados)
      setJugadores(jugadoresActualizados)
    }

    const handleGameStart = (data) => {
      console.log("MENU - Juego iniciado:", data.code)
      router.push(`/Juego?code=${data.code}`)
    }

    const handleRoomCreated = (data) => {
      console.log("MENU - Sala creada:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setCreateRoomOpen(false)
    }

    const handleRoomJoined = (data) => {
      console.log("MENU - Te uniste a la sala:", data.code)
      setCodigo(data.code)
      setInLobby(true)
      setJoinRoomOpen(false)
    }

    const handleErrorRoom = (msg) => {
      console.error("MENU - Error de sala:", msg)
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
    if (!socket) {
      console.error("CREAR SALA - No hay socket")
      alert("No hay conexión con el servidor")
      return
    }

    console.log("CREAR SALA - Solicitando creación")
    socket.emit("createRoom", {})
  }

  // Función para unirse a sala
  const joinRoom = () => {
    if (!codigo || codigo.trim() === "") {
      console.error("UNIRSE SALA - Código vacío")
      alert("Por favor ingresa un código de sala")
      return
    }

    if (!socket) {
      console.error("UNIRSE SALA - No hay socket")
      alert("No hay conexión con el servidor")
      return
    }

    const codigoLimpio = codigo.trim().toUpperCase()

    console.log("UNIRSE SALA - Código:", codigoLimpio)
    socket.emit("joinRoom", { code: codigoLimpio })
  }

  // ✨ NUEVA FUNCIÓN: Salir del lobby
  const salirDelLobby = () => {
    console.log("MENU - Saliendo del lobby")
    // Opcional: emitir evento al servidor para que el jugador salga
    // if (socket) {
    //   socket.emit("leaveRoom", { code: codigo })
    // }
    setInLobby(false)
    setCodigo("")
    setJugadores([])
  }

  // Si está en el lobby, mostrar componente Lobby
  if (inLobby) {
    return (
      <Lobby
        codigo={codigo}
        socket={socket}
        jugadores={jugadores}
        onSalir={salirDelLobby}
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
              ¡Prepárate para el desafío más sabroso! Tu misión es preparar y entregar hamburguesas perfectas para ganar teniendo el menor tiempo.
              Los pedidos los tendrás que hacer rápido, ¡así que tendrás que ser veloz y preciso! Cuanto más rápido entregues y más cerca de ganar,
              Al final de cada jornada, verás tu puntaje y tu tiempo.
              ¡Corre contra el reloj y demuestra que eres el Master Burger Chef del mundo!
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