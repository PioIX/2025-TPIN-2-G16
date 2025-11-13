"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import styles from "./page.module.css";

export default function RegistroYLogin() {
  const [modo, setModo] = useState("login");
  const [nombre_usuario, setNombre_Usuario] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmContraseña, setConfirmContraseña] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [textoMensaje, setTextoMensaje] = useState("");
  const router = useRouter();
  
  const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000);
  };

  async function ingresar() {
    if (!nombre_usuario || !contraseña) {
      showModal("Error", "Debes completar todos los campos")
      return
    }
    
    const datosLogin = {
      nombre_usuario: nombre_usuario,
      contraseña: contraseña,
    }
    
    try {
      console.log("📤 LOGIN - Enviando datos:", datosLogin)
      
      const response = await fetch("http://localhost:4000/loginUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      })
      
      const result = await response.json()
      console.log("📥 LOGIN - Respuesta del servidor:", result)
      
      if (result.validar === true) {
        console.log("💾 LOGIN - Guardando ID en sessionStorage:", result.id)
        console.log("💾 LOGIN - Tipo del ID:", typeof result.id)
        
        // Guardar el ID
        sessionStorage.setItem("jugadorId", result.id)
        
        // Verificar que se guardó correctamente
        const verificar = sessionStorage.getItem("jugadorId")
        console.log("✅ LOGIN - ID verificado en sessionStorage:", verificar)
        console.log("✅ LOGIN - Tipo del ID verificado:", typeof verificar)
        
        // Pequeño delay antes de redirigir
        setTimeout(() => {
          if (result.administrador === 1 || result.administrador === true) {
            router.push("/administrador")
          } else {
            router.push("/menu")
          }
        }, 100)
        
      } else {
        console.log("❌ LOGIN - Credenciales incorrectas")
        showModal("Error", result.message || "Credenciales incorrectas")
      }
    } catch (error) {
      console.error("❌ LOGIN - Error:", error)
      showModal("Error", "Hubo un problema con la conexión al servidor.")
    }
  }

  async function registrar() {
    if (!nombre_usuario || !email || !contraseña || !confirmContraseña) {
      showModal("Error", "Debes completar todos los campos")
      return
    }

    if (contraseña !== confirmContraseña) {
      showModal("Error", "Las contraseñas no coinciden")
      return
    }

    const datosRegistro = {
      nombre_usuario,
      email,
      contraseña,
    };

    console.log("📤 REGISTRO - Datos a enviar:", datosRegistro)

    try {
      const response = await fetch("http://localhost:4000/registroUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      console.log("📥 REGISTRO - Status:", response.status)

      const result = await response.json();
      console.log("📥 REGISTRO - Resultado:", result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => setModo("login"), 1500);
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error("❌ REGISTRO - Error:", error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  return (
    <div className={styles.container}>
      {/* Hamburguesa de fondo */}
      <div className={styles.burgerContainer}>
        <div className={styles.burgerIcon}>
          <div className={styles.bunTop}></div>
          <div className={styles.lettuce}></div>
          <div className={styles.cheese}></div>
          <div className={styles.meat}></div>
          <div className={styles.lettuce2}></div>
          <div className={styles.bunBottom}></div>
        </div>
      </div>

      {/* Formulario */}
      <div className={styles.formCard}>
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tab} ${modo === "login" ? styles.tabActive : ""}`} 
            onClick={() => setModo("login")}
          >
            LOGIN
          </button>
          <button 
            className={`${styles.tab} ${modo === "registro" ? styles.tabActive : ""}`} 
            onClick={() => setModo("registro")}
          >
            REGISTRO
          </button>
        </div>
        
        <div className={styles.formContainer}>
          {modo === "login" ? (
            <>
              <Input 
                type="text" 
                placeholder="Nombre de Usuario" 
                value={nombre_usuario} 
                onChange={(e) => setNombre_Usuario(e.target.value)} 
                page="login"
              />
              <Input 
                type="password" 
                placeholder="Contraseña" 
                value={contraseña} 
                onChange={(e) => setContraseña(e.target.value)} 
                page="login"
              />
              <Button onClick={ingresar} text="Ingresar" />
            </>
          ) : (
            <>
              <Input 
                type="text" 
                placeholder="Nombre de usuario" 
                value={nombre_usuario} 
                onChange={(e) => setNombre_Usuario(e.target.value)} 
                page="login"
              />
              <Input 
                type="email" 
                placeholder="Correo electrónico" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                page="login"
              />
              <Input 
                type="password" 
                placeholder="Contraseña" 
                value={contraseña} 
                onChange={(e) => setContraseña(e.target.value)} 
                page="login"
              />
              <Input 
                type="password" 
                placeholder="Confirmar contraseña" 
                value={confirmContraseña} 
                onChange={(e) => setConfirmContraseña(e.target.value)} 
                page="login"
              />
              <Button onClick={registrar} text="Registrarse" />
            </>
          )}
        </div>
      </div>

      {/* Mensaje de notificación */}
      {mostrarMensaje && (
        <div className={styles.mensaje}>
          {textoMensaje}
        </div>
      )}
    </div>
  )
}