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
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [textoMensaje, setTextoMensaje] = useState("");
  const router = useRouter();

  const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
  };

  async function ingresar() {
    if (!nombre_usuario|| !contraseña) {
      showModal("Error", "Debes completar todos los campos");
      return;
    }
    const datosLogin = {
      nombre_usuario: nombre_usuario,
      contraseña: contraseña,
    };
    try {
      console.log(datosLogin);
      const response = await fetch("http://localhost:4000/loginUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      });
      const result = await response.json();
      console.log("Respuesta del servidor:", result);
      if (result.validar === true) {
        sessionStorage.setItem("playerId", result.id);
        router.push("/menu");
      } else {
        showModal("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  async function registrar() {
    if (!nombre_usuario || !email || !contraseña) {
      showModal("Error", "Debes completar todos los campos");
      return;
    }

    const datosRegistro = {
      nombre_usuario,
      email,
      contraseña,
    };

    try {
      const response = await fetch("http://localhost:4000/registroUsuario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();
      console.log(result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => setModo("login"), 1000);
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
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
                  onChange={(e) => setNombre_usuario(e.target.value)}
                  page="login"
                />
                <Input
                  type="contraseña"
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
                  onChange={(e) => setNombre_usuario(e.target.value)}
                  page="login"
                />
                <Input
                  type="email"
                  placeholder="Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  page="login"
                />
                <Input
                  type="contraseña"
                  placeholder="Contraseña"
                  value={contraseña}
                 onChange={(e) => setContraseña(e.target.value)} 
                  page="login"
                />
                <Button onClick={registrar} text="Registrarse" />
              </>
            )}
          </div>
        </div>
      </div>

      {mostrarMensaje && <div className={styles.mensaje}>{textoMensaje}</div>}
    </div>
  );
}