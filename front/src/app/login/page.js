"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import styles from "./page.module.css";

export default function RegistroYLogin() {
  const [modo, setModo] = useState("login");
  const [nombre_usuario, setNombre_usuario] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [textoMensaje, setTextoMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000);
  };

  async function ingresar() {
    if (!nombre_usuario || !contraseña) {
      showModal("Error", "Debes completar todos los campos");
      return;
    }

    const datosLogin = {
      nombre_usuario: nombre_usuario,
      contraseña: contraseña,
    };

    setCargando(true);

    try {
      console.log("Enviando datos de login:", datosLogin);
      
      const response = await fetch("http://localhost:4000/loginUsuario", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosLogin),
      });

      console.log("Status de respuesta:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`El servidor respondió con error ${response.status}`);
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.validar === true) {
        sessionStorage.setItem("playerId", result.id);
        showModal("Éxito", "¡Inicio de sesión exitoso!");
        setTimeout(() => {
          router.push("/inicio");
        }, 1000);
      } else {
        showModal("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error completo:", error);
      if (error.message.includes("fetch")) {
        showModal("Error", "No se pudo conectar al servidor. Verifica que esté corriendo en http://localhost:4000");
      } else {
        showModal("Error", `Hubo un problema: ${error.message}`);
      }
    } finally {
      setCargando(false);
    }
  }

  async function registrar() {
    if (!nombre_usuario || !email || !contraseña || !confirmarContraseña) {
      showModal("Error", "Debes completar todos los campos");
      return;
    }

    if (contraseña !== confirmarContraseña) {
      showModal("Error", "Las contraseñas no coinciden");
      return;
    }

    if (contraseña.length < 6) {
      showModal("Error", "La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const datosRegistro = {
      nombre_usuario,
      email,
      contraseña,
    };

    setCargando(true);

    try {
      console.log("Enviando datos de registro:", { ...datosRegistro, contraseña: "***" });
      
      const response = await fetch("http://localhost:4000/registroUsuario", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datosRegistro),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(`El servidor respondió con error ${response.status}`);
      }

      const result = await response.json();
      console.log("Respuesta del servidor:", result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => {
          setModo("login");
          setNombre_usuario("");
          setEmail("");
          setContraseña("");
          setConfirmarContraseña("");
        }, 1500);
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error("Error completo:", error);
      if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
        showModal("Error", "No se pudo conectar al servidor. Verifica que esté corriendo en http://localhost:4000");
      } else {
        showModal("Error", `Hubo un problema: ${error.message}`);
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.burgerContainer}>
        <div className={styles.burgerIcon}>
          <div className={styles.bunTop}></div>
          <div className={styles.cheese}></div>
          <div className={styles.meat}></div>
          <div className={styles.lettuce}></div>
          <div className={styles.meat2}></div>
          <div className={styles.lettuce2}></div>
          <div className={styles.bunBottom}></div>
        </div>

        <div className={styles.formCard}>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tab} ${modo === "login" ? styles.tabActive : ""}`}
              onClick={() => setModo("login")}
              disabled={cargando}
            >
              LOGIN
            </button>
            <button
              className={`${styles.tab} ${modo === "registro" ? styles.tabActive : ""}`}
              onClick={() => setModo("registro")}
              disabled={cargando}
            >
              REGISTRO
            </button>
          </div>

          <div className={styles.formContainer}>
            {modo === "login" ? (
              <>
                <Input
                  type="text" 
                  placeholder="Nombre de usuario" 
                  value={nombre_usuario}  
                  onChange={(e) => setNombre_usuario(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Button 
                  onClick={ingresar} 
                  text={cargando ? "Ingresando..." : "Ingresar"} 
                  disabled={cargando}
                />
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Nombre de usuario"
                  value={nombre_usuario}
                  onChange={(e) => setNombre_usuario(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={contraseña}
                  onChange={(e) => setContraseña(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Input
                  type="password"
                  placeholder="Confirmar contraseña"
                  value={confirmarContraseña}
                  onChange={(e) => setConfirmarContraseña(e.target.value)}
                  page="login"
                  disabled={cargando}
                />
                <Button 
                  onClick={registrar} 
                  text={cargando ? "Registrando..." : "Registrarse"} 
                  disabled={cargando}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {mostrarMensaje && <div className={styles.mensaje}>{textoMensaje}</div>}
    </div>
  );
}