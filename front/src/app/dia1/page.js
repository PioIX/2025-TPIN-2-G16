"use client"

import { useEffect, useRef, useState } from 'react'

export default function Dia1() {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState({
    background: false,
    character: false
  });
  const imagesRef = useRef({
    background: null,
    character: null
  });
  const animationRef = useRef({
    characterY: 400,
    targetY: 88,
    isAnimating: true,
    animationSpeed: 3
  });

  const [clientes, setClientes] = useState([]);
  const [clienteActualIndex, setClienteActualIndex] = useState(0);
  const [mostrarPedido, setMostrarPedido] = useState(false);
  const [pedidoMostrado, setPedidoMostrado] = useState(false);

  const cargarClientes = async () => {
    try {
      const response = await fetch('http://localhost:4000/obtenerPedidoCliente');
      const data = await response.json();
      
      if(data.validar){
        setClientes(data.clientes);
        console.log(`${data.total} clientes cargados`);
      } else {
        console.error('No hay clientes disponibles');
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  // Cargar clientes al iniciar
  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    // Cargar imagen de fondo
    const bgImg = document.createElement('img');
    bgImg.onload = () => {
      imagesRef.current.background = bgImg;
      setImagesLoaded(prev => ({ ...prev, background: true }));
    };
    bgImg.src = '/imagenesFondo/hamburgeseria.png';

    // Cargar imagen del personaje actual
    if (clientes[clienteActualIndex]) {
      const charImg = document.createElement('img');
      charImg.onload = () => {
        imagesRef.current.character = charImg;
        setImagesLoaded(prev => ({ ...prev, character: true }));
      };
      charImg.src = `/imagenesPersonajes/${clientes[clienteActualIndex].personaje}.png`;
    } else {
      // Si no hay clientes cargados aún, usar imagen por defecto
      const charImg = document.createElement('img');
      charImg.onload = () => {
        imagesRef.current.character = charImg;
        setImagesLoaded(prev => ({ ...prev, character: true }));
      };
      charImg.src = '/imagenesPersonajes/Personaje1.png';
    }
  }, [clientes, clienteActualIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    const animate = () => {
      // Actualizar posición del personaje
      if (animationRef.current.isAnimating) {
        if (animationRef.current.characterY > animationRef.current.targetY) {
          animationRef.current.characterY -= animationRef.current.animationSpeed;
          
          // Cuando llega a la posición final
          if (animationRef.current.characterY <= animationRef.current.targetY) {
            animationRef.current.characterY = animationRef.current.targetY;
            animationRef.current.isAnimating = false;
            
            // MOSTRAR PEDIDO cuando el personaje llegó
            if (!pedidoMostrado && clientes[clienteActualIndex]) {
              setMostrarPedido(true);
              setPedidoMostrado(true);
              console.log(`Pedido mostrado: ${clientes[clienteActualIndex].pedido}`);
            }
          }
        }
      }
      drawScene(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [imagesLoaded, pedidoMostrado, clientes, clienteActualIndex]);

  const drawScene = (ctx) => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Dibujar fondo
    if (imagesRef.current.background && imagesLoaded.background) {
      ctx.drawImage(imagesRef.current.background, 0, 0, window.innerWidth, window.innerHeight);
    }

    // Dibujar personaje
    if (imagesRef.current.character && imagesLoaded.character) {
      const scaleX = window.innerWidth / 550;
      const scaleY = window.innerHeight / 400;
      
      const charX = 50 * scaleX;
      const charY = animationRef.current.characterY * scaleY;
      const charWidth = 150 * scaleX;
      const charHeight = 280 * scaleY;
      
      ctx.drawImage(imagesRef.current.character, charX, charY, charWidth, charHeight);
    }
  };

  // Función para avanzar al siguiente cliente
  const handleCocinar = () => {
    setMostrarPedido(false);
    setPedidoMostrado(false);
    
    const siguienteIndex = clienteActualIndex + 1;
    
    if (siguienteIndex < clientes.length) {
      // Resetear animación para el siguiente cliente
      animationRef.current.characterY = 400;
      animationRef.current.isAnimating = true;
      setImagesLoaded(prev => ({ ...prev, character: false }));
      
      // Cambiar al siguiente cliente
      setClienteActualIndex(siguienteIndex);
      
      console.log(`Siguiente cliente: ${clientes[siguienteIndex].nombre}`);
    } else {
      alert('¡Felicidades! Has atendido a todos los clientes');
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        drawScene(ctx);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imagesLoaded]);

  const clienteActual = clientes[clienteActualIndex];

  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0
        }}
      />
      
      {/* Modal del pedido */}
      {mostrarPedido && clienteActual && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          minWidth: '300px',
          textAlign: 'center',
          border: '3px solid #ff6b6b'
        }}>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            {clienteActual.nombre}
          </h2>
          
          <div style={{
            backgroundColor: '#fff3cd',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            border: '2px dashed #ffc107'
          }}>
            <p style={{ 
              color: '#856404', 
              fontSize: '18px',
              fontWeight: '600',
              margin: 0
            }}>
              Pedido:
            </p>
            <p style={{ 
              color: '#333', 
              fontSize: '20px',
              fontWeight: 'bold',
              margin: '10px 0 0 0'
            }}>
              {clienteActual.pedido}
            </p>
          </div>
          
          <button
            onClick={handleCocinar}
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '15px 40px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#218838';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#28a745';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🍳 Cocinar
          </button>
          
          <p style={{
            marginTop: '15px',
            color: '#666',
            fontSize: '14px'
          }}>
            Cliente {clienteActualIndex + 1} de {clientes.length}
          </p>
        </div>
      )}
    </div>
  );
}