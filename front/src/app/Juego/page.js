'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Pedido from "@/components/Pedido";
import Cocina from "@/components/Cocina";
import Entrega from "@/components/Entrega";

export default function Juego() {
  const [showPedido, setShowPedido] = useState(false);
  const [showCocina, setShowCocina] = useState(false);
  const [showEntrega, setShowEntrega] = useState(false);

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
            <Entrega />
          </div>
        )}
      </div>
    </>
  );
}