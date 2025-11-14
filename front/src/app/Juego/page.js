'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./page.module.css";
import Pedido from "@/components/Pedido";
import Cocina from "@/components/Cocina";
import Entrega from "@/components/Entrega";

export default function JuegoContent() {
  const router = useRouter();
  const [showPedido, setShowPedido] = useState(true);
  const [showCocina, setShowCocina] = useState(false);
  const [showEntrega, setShowEntrega] = useState(false);

  
  const [clientes, setClientes] = useState([]);
  const [currentClienteIndex, setCurrentClienteIndex] = useState(0);
  const [juegoFinished, setJuegoFinished] = useState(false);

  
  const [timerStarted, setTimerStarted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const timerIntervalRef = useRef(null);

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


  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };


  useEffect(() => {
    const shuffled = shuffleArray(allClientes);
    setClientes(shuffled);
  }, []);

  
  useEffect(() => {
    if (showPedido && !timerStarted && currentClienteIndex === 0) {
      console.log("Timer iniciado - Primer pedido cargado");
      startTimer();
    }
  }, [showPedido, timerStarted, currentClienteIndex]);

  
  const startTimer = () => {
    if (timerIntervalRef.current) return;

    setTimerStarted(true);
    setElapsedTime(0);

    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
      console.log("⏹Timer detenido");
    }
  };

  const resetTimer = () => {
    stopTimer();
    setElapsedTime(0);
    setFinalTime(0);
    setTimerStarted(false);
  };

  const formatTime = (seconds = elapsedTime) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const handleGoToCocina = () => {
    console.log("Cambiando a Kitchen");
    setShowPedido(false);
    setShowCocina(true);
  };

  const handleGoToEntrega = (imageData) => {
    console.log("Cambiando a Entrega");
    setShowCocina(false);
    setShowEntrega(true);
  };


  const handleNextCliente = () => {
    const nextIndex = currentClienteIndex + 1;

    if (nextIndex >= clientes.length) {
      console.log(" ¡Juego terminado!");
      stopTimer();
      setFinalTime(elapsedTime);
      setJuegoFinished(true);
    } else {
      console.log(`Pasando al personaje ${nextIndex + 1}`);
      setCurrentClienteIndex(nextIndex);
      setShowCocina(false);
      setShowEntrega(false);
      setShowPedido(true);
    }
  };

  if (clientes.length === 0) {
    return (
      <div className={styles.container1}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #ffd4a3 0%, #ffb366 100%)',
          color: 'white',
          fontSize: '32px'
        }}>
          Cargando juego...
        </div>
      </div>
    );
  }

  if (juegoFinished) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ffd4a3 0%, #ffb366 100%)',
        padding: '40px'
      }}>
        <h1 style={{
          fontSize: '48px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '40px'
        }}>
           ¡Juego Completado! 
        </h1>

        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '50px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #fff5e6 0%, #ffe4c4 100%)',
              borderRadius: '12px',
              minWidth: '400px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#8b4513' }}>
                Clientes atendidos:
              </span>
              <span style={{ fontSize: '36px', fontWeight: 'bold', color: '#d2691e' }}>
                {clientes.length}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              background: 'linear-gradient(135deg, #fff5e6 0%, #ffe4c4 100%)',
              borderRadius: '12px'
            }}>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#8b4513' }}>
                Tiempo total:
              </span>
              <span style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#ff8c42',
                fontFamily: 'Courier New, monospace',
                letterSpacing: '3px'
              }}>
                {formatTime(finalTime)}
              </span>
            </div>
          </div>
        </div>

        <button
          style={{
            background: 'linear-gradient(135deg, #ffa726 0%, #ff6f00 100%)',
            color: 'white',
            border: 'none',
            padding: '18px 50px',
            fontSize: '22px',
            fontWeight: 'bold',
            borderRadius: '50px',
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(255,143,0,0.4)'
          }}
          onClick={() => router.push('/login')}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <>
      {timerStarted && !juegoFinished && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #ffa726 0%, #ff8c42 100%)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(255,143,0,0.3)',
          zIndex: 1000
        }}>
          <span style={{ fontSize: '24px' }}>⏱️</span>
          <span style={{ fontSize: '28px', letterSpacing: '2px', fontFamily: 'Courier New, monospace' }}>
            {formatTime()}
          </span>
          <span style={{ fontSize: '14px', opacity: 0.9, paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.5)' }}>
            Cliente {currentClienteIndex + 1}/{clientes.length}
          </span>
        </div>
      )}

      <div className={styles.container1}>
        {showPedido && (
          <div className={styles.section}>
            <Pedido
              key={`pedido-${currentClienteIndex}`}
              onGoToCocina={handleGoToCocina}
            />
          </div>
        )}

        {showCocina && (
          <div className={styles.section}>
            <Cocina onGoToEntrega={handleGoToEntrega} />
          </div>
        )}

        {showEntrega && (
          <div className={styles.section}>
            <Entrega
              onNextCliente={handleNextCliente}
              currentCliente={currentClienteIndex + 1}
              totalClientes={clientes.length}
              showThanks={true}
              showNextButton={true}
            />
          </div>
        )}
      </div>
    </>
  );
}