import React, { useState, useEffect } from 'react';
import useConnection from '../hooks/useConnection';

function Lobby() {
    const [userId, setUserId] = useState(null);
    const [inputCode, setInputCode] = useState('');
    
    // Hook de conexión - CAMBIAR LA IP POR LA DE TU SERVIDOR
    const {
        isConnected,
        error,
        roomCode,
        jugadores,
        gameStarted,
        createRoom,
        joinRoom,
        startGame
    } = useConnection("http://localhost:4000"); // Cambiar por http://TU_IP:4000

    // Obtener el ID del usuario del localStorage o de donde lo guardes
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
            setUserId(parseInt(storedUserId));
        }
    }, []);

    // Si el juego inició, redirigir o mostrar algo
    useEffect(() => {
        if (gameStarted) {
            console.log('¡El juego ha comenzado!');
            // Aquí puedes redirigir a la pantalla del juego
            // navigate('/game');
        }
    }, [gameStarted]);

    const handleCreateRoom = () => {
        if (userId) {
            createRoom(userId);
        } else {
            alert('Debes iniciar sesión primero');
        }
    };

    const handleJoinRoom = () => {
        if (!inputCode.trim()) {
            alert('Ingresa un código de sala');
            return;
        }
        if (userId) {
            joinRoom(inputCode.toUpperCase(), userId);
        } else {
            alert('Debes iniciar sesión primero');
        }
    };

    const handleStartGame = () => {
        if (roomCode) {
            startGame(roomCode);
        }
    };

    const isHost = jugadores.length > 0 && jugadores[0]?.id_jugador === userId;

    return (
        <div className="lobby-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Lobby del Juego</h1>
            
            {/* Estado de conexión */}
            <div style={{ 
                padding: '10px', 
                backgroundColor: isConnected ? '#d4edda' : '#f8d7da',
                borderRadius: '5px',
                marginBottom: '20px'
            }}>
                {isConnected ? '✅ Conectado al servidor' : '❌ Desconectado del servidor'}
            </div>

            {/* Errores */}
            {error && (
                <div style={{
                    padding: '10px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '5px',
                    marginBottom: '20px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Si no está en una sala */}
            {!roomCode && (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            onClick={handleCreateRoom}
                            disabled={!isConnected}
                            style={{
                                padding: '15px 30px',
                                fontSize: '16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isConnected ? 'pointer' : 'not-allowed',
                                width: '100%',
                                marginBottom: '10px'
                            }}
                        >
                            🎮 Crear Nueva Sala
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', margin: '20px 0' }}>
                        <strong>— O —</strong>
                    </div>

                    <div>
                        <input
                            type="text"
                            placeholder="Código de sala"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            style={{
                                padding: '12px',
                                fontSize: '16px',
                                width: '100%',
                                marginBottom: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                textTransform: 'uppercase'
                            }}
                            maxLength={6}
                        />
                        <button
                            onClick={handleJoinRoom}
                            disabled={!isConnected}
                            style={{
                                padding: '15px 30px',
                                fontSize: '16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: isConnected ? 'pointer' : 'not-allowed',
                                width: '100%'
                            }}
                        >
                            🚪 Unirse a Sala
                        </button>
                    </div>
                </div>
            )}

            {/* Si está en una sala */}
            {roomCode && (
                <div>
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#e7f3ff',
                        borderRadius: '5px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        <h2>Código de Sala</h2>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            letterSpacing: '5px',
                            color: '#007bff'
                        }}>
                            {roomCode}
                        </div>
                        <small>Comparte este código con tu amigo</small>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h3>Jugadores ({jugadores.length}/2)</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {jugadores.map((jugador, index) => (
                                <li key={jugador.id_jugador} style={{
                                    padding: '10px',
                                    backgroundColor: jugador.esHost ? '#fff3cd' : '#f8f9fa',
                                    borderRadius: '5px',
                                    marginBottom: '5px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span>
                                        {index + 1}. {jugador.nombre_usuario}
                                    </span>
                                    {jugador.esHost && (
                                        <span style={{
                                            backgroundColor: '#ffc107',
                                            padding: '3px 8px',
                                            borderRadius: '3px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            HOST
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Solo el host puede iniciar */}
                    {isHost && jugadores.length === 2 && (
                        <button
                            onClick={handleStartGame}
                            style={{
                                padding: '15px 30px',
                                fontSize: '18px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                width: '100%',
                                fontWeight: 'bold'
                            }}
                        >
                            🎮 INICIAR JUEGO
                        </button>
                    )}

                    {jugadores.length < 2 && (
                        <div style={{
                            padding: '15px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '5px',
                            textAlign: 'center'
                        }}>
                            ⏳ Esperando al segundo jugador...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Lobby;