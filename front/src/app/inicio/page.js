'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './page.module.css'

export default function MenuPrincipal() {
  const router = useRouter()
  const [mostrarReglas, setMostrarReglas] = useState(false)

  const handleJugar = () => {
    router.push('/dia1')
  }

  const toggleReglas = () => {
    setMostrarReglas(!mostrarReglas)
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
            <h2 className={styles.modalTitle}>Reglas del Juego</h2>
            <p className={styles.modalText}>
              El objetivo del juego es preparar y entregar hamburguesas correctamente y a tiempo para satisfacer a los clientes y ganar puntos. 
              A medida que avanzan los días, los pedidos serán más numerosos y complejos, poniendo a prueba tu rapidez y memoria.
              El jugador que entregue las hamburguesas más rápido y correctamente acumulará más puntos y podrá subir en el ranking global y semanal.
              Al final de cada jornada, verás tu puntaje total y posición respecto a otros jugadores.
              El éxito depende de tu velocidad, precisión y estrategia.
            </p>
            <button className={styles.closeButton} onClick={toggleReglas}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}