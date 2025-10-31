'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Pedido from "@/components/Pedido";
import Cocina from "@/components/Cocina";
import Entrega from "@/components/Entrega";

export default function JuegoContent() {
  const [showPedido, setShowPedido] = useState(false);
  const [showCocina, setShowCocina] = useState(false);
  const [showEntrega, setShowEntrega] = useState(false);

  // Sistema de personajes
  const [clientes, setClientes] = useState([]);
  const [currentClienteIndex, setCurrentClienteIndex] = useState(0);
  const [juegoFinished, setJuegoFinished] = useState(false);

  const allClientes = [
    { id: 1, nombre: 'Personaje 1' },
    { id: 2, nombre: 'Personaje 2' },
    { id: 3, nombre: 'Personaje 3' },
    { id: 4, nombre: 'Personaje 4' },
    { id: 5, nombre: 'Personaje 5' },
    { id: 6, nombre: 'Personaje 6' },
    { id: 7, nombre: 'Personaje 7' },
    { id: 8, nombre: 'Personaje 8' }
  ];

  // Función para barajar el array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Inicializar personajes barajados al montar el componente
  useEffect(() => {
    const shuffled = shuffleArray(allClientes);
    setCustomers(shuffled);
  }, []);

  const handleGoToCocina = () => {
    console.log("Cambiando a Kitchen");
    setShowCocina(true);
  };

  const handleGoToEntrega = (imageData) => {
    console.log("Cambiando a Entrega con imagen:", imageData);
    //setHamburguesaImage(imageData);
    setShowCocina(false);
    setShowEntrega(true);
  };

  // Función para pasar al siguiente personaje o terminar el juego
  const handleNextCliente = () => {
    const nextIndex = currentClienteIndex + 1;

    if (nextIndex >= clientes.length) {
      // Ya pasaron los 8 personajes, terminar el juego y DETENER EL TIMER
      console.log("¡Juego terminado! Han pasado todos los personajes");
      stopTimer();
      setJuegoFinished(true);
    } else {
      // Resetear estados y pasar al siguiente personaje
      console.log(`Pasando al personaje ${nextIndex + 1} de ${customers.length}`);
      setCurrentClienteIndex(nextIndex);
      setShowCocina(false);
      setShowEntrega(false);
    }
  };

  // Si no hay personajes cargados aún, mostrar loading
  if (clientes.length === 0) {
    return <div className={styles.container1}>Cargando...</div>;
  }

  // Si el juego terminó, mostrar pantalla final
  if (juegoFinished) {
    return (
      <div className={styles.container1}>
        <div className={styles.section}>
          <h1>¡Juego Terminado!</h1>
          <p>Han pasado los 8 personajes</p>
          <p>Tiempo total: {formatTime()}</p>
          <button onClick={() => {
            resetTimer();
            window.location.reload();
          }}>
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const currentCliente = clientes[currentClienteIndex];

  return (
    <>
      <div className={styles.container1}>
        {!showEntrega ? (
          !showCocina ? (
            <>
              <div className={styles.section}>
                <Pedido key={Date.now()} onGoToCocina={handleGoToCocina} />
              </div>
            </>
          ) : (
            <>
              <div className={styles.section}>
                <Cocina onGoToEntrega={handleGoToEntrega} />
              </div>
            </>
          )
        ) : (
          <div className={styles.section}>
            <Entrega onNextCliente={handleNextCliente}
              currentCliente={currentClienteIndex + 1}
              totalClientes={clientes.length} />
          </div>
        )}
      </div>
    </>
  );
}

export default function Juego() {
return (
<GameContent />
);
}