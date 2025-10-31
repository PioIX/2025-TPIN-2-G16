"use client"

import styles from "./Entrega.module.css"
import { useRef, useEffect, useState } from "react";

export default function Entrega() {
  const [characterImage, setCharacterImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [clienteNombre, setClienteNombre] = useState(''); // ✅ Ahora es estado

  // ✅ localStorage solo dentro de useEffect (lado del cliente)
  useEffect(() => {
    const nombre = localStorage.getItem('currentClienteNombre');
    setClienteNombre(nombre);

    const fetchPedido = async () => {
      try {
        setLoading(true);
        if (nombre) {
          setCharacterImage(`/imagenesPersonajes/${nombre}.png`);
        }
      } catch (error) {
        console.error('Error al cargar el cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, []); // Se ejecuta una sola vez al montar

  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState({
    background: false,
    character: false
  });
  const imagesRef = useRef({
    background: null,
    character: null
  });

  useEffect(() => {
    const bgImg = new Image();
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.onerror = () => {
      console.error('Error cargando fondo');
      setImagesLoaded(prev => ({ ...prev, background: false }));
    };
    bgImg.src = '/imagenesFondo/hamburgeseria.png';

    if (characterImage) {
      const charImg = new Image();
      charImg.onload = () => {
        imagesRef.current.character = charImg;
        setImagesLoaded(prev => ({ ...prev, character: true }));
      };
      charImg.onerror = () => {
        console.error('Error cargando personaje');
        setImagesLoaded(prev => ({ ...prev, character: false }));
      };
      charImg.src = characterImage;
    }

    return () => {
      imagesRef.current.background = null;
      imagesRef.current.character = null;
    };
  }, [characterImage]);

  const drawScene = (ctx) => {
    if (!ctx) return;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    if (imagesRef.current.background && imagesLoaded.background) {
      ctx.drawImage(imagesRef.current.background, 0, 0, window.innerWidth, window.innerHeight);
    }

    if (imagesRef.current.character && imagesLoaded.character) {
      const scaleX = window.innerWidth / 550;
      const scaleY = window.innerHeight / 400;

      const charX = 50 * scaleX;
      const charY = 91 * scaleY;
      const charWidth = 150 * scaleX;
      const charHeight = 280 * scaleY;

      ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawScene(ctx);
  }, [imagesLoaded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawScene(ctx);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  const handleNextCliente = () => {
    if (onNextCliente) {
      onNextCliente();
    }
  };

  return (
    <div className={styles.oContainer}>
      <div className={styles.header}>
        <div className={styles.percent}></div>
        <div className={styles.order}></div>
        <div className={styles.time}></div>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />

      {showThanks && (
        <div className={styles.dialogContainer}>
          <div className={styles.dialogBubble}>
            <p className={styles.dialogText}>
              ¡Gracias!
            </p>
          </div>
        </div>
      )}

      {showNextButton && (
        <div className={styles.nextButtonContainer}>
          <button
            className={styles.nextButton}
            onClick={handleNextCliente}
          >
            {currentCliente < totalClientes
              ? `Siguiente cliente`
              : '¡Terminar juego!'
            }
          </button>
        </div>
      )}

    </div>
  );
}