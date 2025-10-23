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

      let result;
      let errorMessage = null;

      // Intentar parsear la respuesta
      try {
        const textResponse = await response.text();
        console.log("Respuesta en texto:", textResponse);
        console.log("Content-Type:", response.headers.get('content-type'));
        
        if (textResponse) {
          // Verificar si la respuesta parece ser HTML
          if (textResponse.trim().startsWith('<!DOCTYPE') || textResponse.trim().startsWith('<html')) {
            console.error("El servidor devolvió HTML en lugar de JSON");
            errorMessage = "El servidor devolvió una respuesta inválida (HTML en lugar de JSON)";
          } else {
            try {
              result = JSON.parse(textResponse);
            } catch (parseError) {
              console.error("Error al parsear JSON:", parseError);
              console.error("Texto recibido:", textResponse.substring(0, 200));
              errorMessage = "Respuesta inválida del servidor";
            }
          }
        }
      } catch (readError) {
        console.error("Error al leer respuesta:", readError);
        errorMessage = "No se pudo leer la respuesta del servidor";
      }

      // Manejar errores HTTP
      if (!response.ok) {
        const mensaje = errorMessage || 
                       (result && (result.message || result.error)) || 
                       `Error del servidor (${response.status})`;
        showModal("Error", mensaje);
        setCargando(false);
        return;
      }

      // Procesar respuesta exitosa
      console.log("Respuesta procesada:", result);

      if (result && result.validar === true) {
        sessionStorage.setItem("playerId", result.id);
        showModal("Éxito", "¡Inicio de sesión exitoso!");
        setTimeout(() => {
          router.push("/inicio");
        }, 1000);
      } else {
        showModal("Error", (result && result.message) || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error completo:", error);
      if (error.message && error.message.includes("fetch")) {
        showModal("Error", "No se pudo conectar al servidor. Verifica que esté corriendo en http://localhost:4000");
      } else {
        showModal("Error", `Hubo un problema: ${error.message || "Error desconocido"}`);
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

      console.log("Status de respuesta:", response.status);

      let result;
      let errorMessage = null;

      // Intentar parsear la respuesta
      try {
        const textResponse = await response.text();
        console.log("Respuesta en texto:", textResponse);
        console.log("Content-Type:", response.headers.get('content-type'));
        
        if (textResponse) {
          // Verificar si la respuesta parece ser HTML
          if (textResponse.trim().startsWith('<!DOCTYPE') || textResponse.trim().startsWith('<html')) {
            console.error("El servidor devolvió HTML en lugar de JSON");
            errorMessage = "El servidor devolvió una respuesta inválida (HTML en lugar de JSON)";
          } else {
            try {
              result = JSON.parse(textResponse);
            } catch (parseError) {
              console.error("Error al parsear JSON:", parseError);
              console.error("Texto recibido:", textResponse.substring(0, 200));
              errorMessage = "Respuesta inválida del servidor";
            }
          }
        }
      } catch (readError) {
        console.error("Error al leer respuesta:", readError);
        errorMessage = "No se pudo leer la respuesta del servidor";
      }

      // Manejar errores HTTP
      if (!response.ok) {
        const mensaje = errorMessage || 
                       (result && (result.message || result.error)) || 
                       `Error del servidor (${response.status})`;
        showModal("Error", mensaje);
        setCargando(false);
        return;
      }

      // Procesar respuesta exitosa
      console.log("Respuesta procesada:", result);

      if (result && result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => {
          setModo("login");
          setNombre_usuario("");
          setEmail("");
          setContraseña("");
          setConfirmarContraseña("");
        }, 1500);
      } else {
        showModal("Error", (result && result.message) || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error("Error completo:", error);
      if (error.message && error.message.includes("fetch")) {
        showModal("Error", "No se pudo conectar al servidor. Verifica que esté corriendo en http://localhost:4000");
      } else {
        showModal("Error", `Hubo un problema: ${error.message || "Error desconocido"}`);
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