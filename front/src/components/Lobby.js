'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Lobby({ codigo, socket, jugadores }) {
  const router = useRouter()
  const [miId, setMiId] = useState(null)
  const [esHost, setEsHost] = useState(false)
  const [copiado, setCopiado] = useState(false)

  
  useEffect(() => {
    const jugadorId = sessionStorage.getItem("jugadorId")
    console.log("🎮 LOBBY - Mi ID:", jugadorId)
    if (jugadorId) {
      setMiId(parseInt(jugadorId))
    }
  }, [])

  
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

  // Función para salir de la sala
  const salirDeLaSala = () => {
    if (socket) {
      console.log("🚪 LOBBY - Saliendo de la sala...")
      socket.emit("leaveLobby", { code: codigo, playerId: miId })
      socket.disconnect()
    }
    
    // Limpiar sessionStorage
    sessionStorage.removeItem("jugadorId")
    sessionStorage.removeItem("codigoSala")
    
    // Volver a la página anterior o al inicio
    router.push('/')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-2xl border border-white/20">
        
        {/* Botón volver atrás */}
        <button 
          onClick={salirDeLaSala}
          className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <span className="text-2xl">←</span>
          <span>Salir de la sala</span>
        </button>

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎮 Sala de Espera
        </h1>
        
        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <p className="text-white/70 text-sm mb-2 text-center">Código de sala:</p>
          <div className="flex items-center gap-3 justify-center">
            <span className="text-3xl font-mono font-bold text-white bg-black/30 px-6 py-3 rounded-lg tracking-wider">
              {codigo}
            </span>
            <button 
              onClick={copiarCodigo}
              className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                copiado 
                  ? 'bg-green-500 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </button>
          </div>
          <p className="text-white/60 text-sm mt-3 text-center">
            Comparte este código con tu amigo
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Jugadores ({jugadores.length}/2)
          </h2>
          <div className="space-y-3">
            {jugadores.map((jugador) => (
              <div 
                key={jugador.id_jugador} 
                className="bg-white/10 rounded-lg p-4 flex items-center justify-between border border-white/10"
              >
                <span className="text-white font-semibold text-lg">
                  {jugador.nombre_usuario}
                </span>
                <div className="flex gap-2">
                  {jugador.esHost === 1 && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold border border-yellow-500/30">
                      👑 Host
                    </span>
                  )}
                  {jugador.id_jugador === miId && (
                    <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                      Tú
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            
            {jugadores.length < 2 && (
              <div className="bg-white/5 rounded-lg p-4 border-2 border-dashed border-white/20">
                <span className="text-white/50 text-lg">
                  ⏳ Esperando jugador...
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {esHost ? (
            <button 
              onClick={iniciarJuego} 
              disabled={jugadores.length < 2}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                jugadores.length < 2
                  ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {jugadores.length < 2 ? '⏳ Esperando jugadores...' : '🎮 Iniciar Juego'}
            </button>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
              <p className="text-blue-200 font-semibold">
                ⏳ Esperando a que el host inicie el juego...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}