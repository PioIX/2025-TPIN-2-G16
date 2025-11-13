"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminPage() {
    const router = useRouter();
    const API_BASE = "http://localhost:4000";

    const [jugadores, setJugadores] = useState([]);
    const [modoEdicion, setModoEdicion] = useState({ activo: false, jugadorId: null });
    const [datosEdicion, setDatosEdicion] = useState({});
    const [notificacion, setNotificacion] = useState({ visible: false, texto: "" });
    const [filtro, setFiltro] = useState("");

    useEffect(() => {
        obtenerListaJugadores();
    }, []);

    const mostrarNotificacion = (texto) => {
        setNotificacion({ visible: true, texto });
        setTimeout(() => setNotificacion({ visible: false, texto: "" }), 3000);
    };

    const obtenerListaJugadores = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/jugadores`);
            const datos = await res.json();
            console.log("📥 ADMIN - Datos recibidos:", datos);

            datos.success && setJugadores(datos.jugadores);
        } catch (err) {
            console.error("Error en obtenerListaJugadores:", err);
            mostrarNotificacion("Error al cargar los usuarios");
        }
    };

    const iniciarEdicion = (jugador) => {
        setModoEdicion({ activo: true, jugadorId: jugador.id_jugador });
        setDatosEdicion({
            nombre_usuario: jugador.nombre_usuario,
            email: jugador.email,
            contraseña: jugador.contraseña,
            administrador: jugador.administrador === 1
        });
    };

    const cancelarEdicion = () => {
        setModoEdicion({ activo: false, jugadorId: null });
        setDatosEdicion({});
    };

    const actualizarCampo = (campo, valor) => {
        setDatosEdicion(prev => ({ ...prev, [campo]: valor }));
    };

    const guardarCambios = async (idJugador) => {
        try {
            const payload = {
                ...datosEdicion,
                administrador: datosEdicion.administrador ? 1 : 0
            };

            const res = await fetch(`${API_BASE}/admin/jugadores/${idJugador}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const resultado = await res.json();

            if (resultado.success) {
                mostrarNotificacion("Usuario actualizado correctamente");
                await obtenerListaJugadores();
                cancelarEdicion();
            } else {
                mostrarNotificacion("Error al actualizar el usuario");
            }
        } catch (err) {
            console.error("Error en guardarCambios:", err);
            mostrarNotificacion("Error de conexión al actualizar");
        }
    };

    const cerrarSesion = () => {
        sessionStorage.clear();
        router.push("/login");
    };

    const jugadoresFiltrados = jugadores.filter(j =>
        j.nombre_usuario.toLowerCase().includes(filtro.toLowerCase()) ||
        j.email.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className={styles.wrapper}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logoContainer}>
                        <div className={styles.logo}>👤</div>
                        <h2 className={styles.logoText}>Admin</h2>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <div className={styles.navItem}>
                        <span className={styles.navIcon}>👥</span>
                        <span className={styles.navText}>Usuarios</span>
                    </div>
                </nav>

                <button onClick={cerrarSesion} className={styles.logoutBtn}>
                    <span className={styles.logoutIcon}>❌</span>
                    Cerrar Sesión
                </button>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topBar}>
                    <div>
                        <h1 className={styles.pageTitle}>Gestión de Usuarios</h1>
                        <p className={styles.pageSubtitle}>Administra y edita la información de los jugadores</p>
                    </div>

                    <div className={styles.statsContainer}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber}>{jugadores.length}</div>
                            <div className={styles.statLabel}>Total Usuarios</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.statCardOrange}`}>
                            <div className={styles.statNumber}>{jugadores.filter(j => j.administrador === 1).length}</div>
                            <div className={styles.statLabel}>Admins</div>
                        </div>
                    </div>
                </header>

                {notificacion.visible && (
                    <div className={styles.notification}>
                        <span className={styles.notifIcon}>✓</span>
                        {notificacion.texto}
                    </div>
                )}

                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}></span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.cardsGrid}>
                    {jugadoresFiltrados.map((jugador) => {
                        const estaEditando = modoEdicion.activo && modoEdicion.jugadorId === jugador.id_jugador;

                        return (
                            <div key={jugador.id_jugador} className={styles.userCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.userAvatar}>
                                        {jugador.nombre_usuario.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={styles.cardBadges}>
                                        {jugador.administrador === 1 && (
                                            <span className={styles.adminBadge}>ADMIN</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.cardBody}>
                                    {estaEditando ? (
                                        <>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Usuario</label>
                                                <input
                                                    type="text"
                                                    value={datosEdicion.nombre_usuario}
                                                    onChange={(e) => actualizarCampo("nombre_usuario", e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Email</label>
                                                <input
                                                    type="email"
                                                    value={datosEdicion.email}
                                                    onChange={(e) => actualizarCampo("email", e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>

                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Contraseña</label>
                                                <input
                                                    type="text"
                                                    value={datosEdicion.contraseña}
                                                    onChange={(e) => actualizarCampo("contraseña", e.target.value)}
                                                    className={styles.input}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3 className={styles.userName}>{jugador.nombre_usuario}</h3>
                                            <p className={styles.userEmail}>{jugador.email}</p>
                                            <div className={styles.userInfo}>
                                                <div className={styles.infoItem}>
                                                    <span className={styles.infoLabel}>ID:</span>
                                                    <span className={styles.infoValue}>#{jugador.id_jugador}</span>
                                                </div>
                                                <div className={styles.infoItem}>
                                                    <span className={styles.infoLabel}>Password:</span>
                                                    <span className={styles.infoValue}>{"•".repeat(8)}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className={styles.cardFooter}>
                                    {estaEditando ? (
                                        <>
                                            <button
                                                onClick={() => guardarCambios(jugador.id_jugador)}
                                                className={styles.btnSave}
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={cancelarEdicion}
                                                className={styles.btnCancel}
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => iniciarEdicion(jugador)}
                                            className={styles.btnEdit}
                                        >
                                            Editar Usuario
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}