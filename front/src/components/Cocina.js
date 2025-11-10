"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./Cocina.module.css"

//SECCIÓN DE LA COCINA DE HAMBURGUESAS
export default function Cocina({onGoToEntrega}) {
    const ingredientsBox = [
        {id:1, name:"Pan Abajo", image:"/imagenesHamburguesa/PanAbajo.png", type: "base", size: 200},
        {id:2, name:"Carne", image:"/imagenesHamburguesa/Carne.png", type: "ingredient", size: 180},
        {id:3, name:"Queso", image:"/imagenesHamburguesa/Queso.png", type: "ingredient", size: 180},
        {id:4, name:"Lechuga", image:"/imagenesHamburguesa/Lechuga.png", type: "ingredient", size: 180},
        {id:5, name:"Tomate", image:"/imagenesHamburguesa/Tomate.png", type: "ingredient", size: 180},
        {id:6, name:"Cebolla", image:"/imagenesHamburguesa/Cebolla.png", type: "ingredient", size: 180},
        {id:7, name:"Pan Arriba", image:"/imagenesHamburguesa/PanArriba.png", type: "top", size: 200},
        {id:8, name:"Panceta", image:"/imagenesHamburguesa/Panceta.png", type: "ingredient", size: 180},
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true])
    const [visiblePatties, setVisiblePatties] = useState([true, true, true, true])
    const [activeHamburger, setActiveHamburger] = useState(false)
    const [hamburgerLayers, setHamburgerLayers] = useState([])
    const [hamburgerFinished, setHamburgerFinished] = useState(false)
    
    const canvasRef = useRef(null)
    const layerHeight = useRef(30)

    // Configurar canvas cuando aparece la hamburguesa
    useEffect(() => {
        if (activeHamburger && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 260
            canvas.height = 320
            
            const ctx = canvas.getContext('2d')
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }, [activeHamburger])

    // Redibujar hamburguesa cuando cambian las capas
    useEffect(() => {
        if (activeHamburger && hamburgerLayers.length > 0) {
            redrawHamburger()
        }
    }, [hamburgerLayers])

    const redrawHamburger = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calcular la altura total de la hamburguesa
        const totalHeight = hamburgerLayers.length * layerHeight.current + 50
        
        // Calcular offset para centrar verticalmente
        const startY = Math.max(10, canvas.height - totalHeight)

        // Dibujar cada capa desde abajo hacia arriba
        hamburgerLayers.forEach((layer, index) => {
            if (layer.image.complete) {
                const yPosition = startY + (hamburgerLayers.length - 1 - index) * layerHeight.current
                const xPosition = (canvas.width - layer.size) / 2
                ctx.drawImage(layer.image, xPosition, yPosition, layer.size, layer.size)
            }
        })
    }

    const handleBunClick = (index) => {
        if (activeHamburger) {
            alert("¡Ya tienes una hamburguesa en progreso!")
            return
        }
        
        console.log(`Pan ${index + 1} clickeado`)
        
        const newVisibleBuns = [...visibleBuns]
        newVisibleBuns[index] = false
        setVisibleBuns(newVisibleBuns)
        
        setActiveHamburger(true)
        
        // Agregar pan de abajo como primera capa
        addIngredientToHamburger(ingredientsBox[0])
    }

    const handlePattyClick = (index) => {
        if (!activeHamburger) {
            alert("¡Primero debes seleccionar un pan!")
            return
        }
        
        if (hamburgerFinished) {
            alert("¡Esta hamburguesa ya está terminada! Entrégala o reinicia.")
            return
        }
        
        console.log(`Carne ${index + 1} clickeada`)
        
        const newVisiblePatties = [...visiblePatties]
        newVisiblePatties[index] = false
        setVisiblePatties(newVisiblePatties)
        
        // Agregar carne a la hamburguesa
        addIngredientToHamburger(ingredientsBox[1])
    }

    const handleIngredientClick = (ingredient) => {
        if (!activeHamburger) {
            alert("¡Primero debes seleccionar un pan!")
            return
        }
        
        if (hamburgerFinished) {
            alert("¡Esta hamburguesa ya está terminada! Entrégala o reinicia.")
            return
        }

        // Si es el pan de arriba, finalizar hamburguesa
        if (ingredient.type === "top") {
            console.log(`Pan Arriba agregado - Hamburguesa finalizada`)
            addIngredientToHamburger(ingredient)
            setHamburgerFinished(true)
            return
        }
        
        console.log(`Ingrediente ${ingredient.name} clickeado`)
        addIngredientToHamburger(ingredient)
    }

    const addIngredientToHamburger = (ingredient) => {
        const img = new Image()
        img.onload = () => {
            console.log(`✓ Imagen cargada: ${ingredient.name}`)
            setHamburgerLayers(prevLayers => [
                ...prevLayers,
                {
                    ingredient: ingredient,
                    image: img,
                    size: ingredient.size
                }
            ])
        }
        img.onerror = () => {
            console.error(`✗ Error cargando imagen: ${ingredient.image}`)
            alert(`No se pudo cargar la imagen: ${ingredient.name}`)
        }
        img.src = ingredient.image
    }

    const handleGoToEntrega = () => {
        if (hamburgerLayers.length === 0) {
            alert("¡Debes armar una hamburguesa primero!")
            return
        }
        
        if (!hamburgerFinished) {
            alert("¡Debes colocar el pan de arriba para finalizar la hamburguesa!")
            return
        }
        
        try {
            if(onGoToEntrega) {
                onGoToEntrega()
            } else {
                console.error("onGoToEntrega no está definida")
            }
        } catch(error) {
            console.error("Error al ir a entrega: ", error)
        }
    }

    const handleResetHamburger = () => {
        setHamburgerLayers([])
        setActiveHamburger(false)
        setHamburgerFinished(false)
        setVisibleBuns([true, true, true, true, true, true])
        setVisiblePatties([true, true, true, true])
        
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
    }

    return (
        <div className={styles.container}>
            {/* Botones superiores */}
            <div className={styles.topButtons}>
                <button className={styles.deliverBtn} onClick={handleGoToEntrega}>
                    🚚 ENTREGAR
                </button>
                <button className={styles.resetBtn} onClick={handleResetHamburger}>
                    🔄 REINICIAR
                </button>
            </div>
            
            {/* Barra de ingredientes superior */}
            <div className={styles.ingredientsBox}>
                {ingredientsBox.slice(2, 8).map((ingredientBox) => (
                    <button 
                        key={ingredientBox.id} 
                        className={`${styles.ingredientBtn} ${hamburgerFinished && ingredientBox.type === "top" ? styles.disabled : ''}`}
                        onClick={() => handleIngredientClick(ingredientBox)} 
                        title={ingredientBox.name}
                        disabled={!activeHamburger || (hamburgerFinished && ingredientBox.type !== "top")}
                    >
                        <img src={ingredientBox.image} alt={ingredientBox.name} />
                        <span className={styles.ingredientLabel}>{ingredientBox.name}</span>
                    </button>
                ))}
            </div>

            <div className={styles.mainArea}>
                <div className={styles.cookingZone}>
                    {/* Parrilla de carnes (IZQUIERDA) */}
                    <div className={styles.pattiesContainer}>
                        <div className={styles.label}>PARRILLA</div>
                        <div className={styles.pattiesGrid}>
                            {[...Array(4)].map((_, index) => (
                                <button 
                                    key={`patty-${index}`} 
                                    className={`${styles.pattyBtn} ${!visiblePatties[index] ? styles.hidden : ''}`} 
                                    onClick={() => handlePattyClick(index)}
                                    style={{ visibility: visiblePatties[index] ? 'visible' : 'hidden' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Panes (CENTRO) */}
                    <div className={styles.bunsContainer}>
                        <div className={styles.label}>PANES</div>
                        <div className={styles.bunsGrid}>
                            {[...Array(6)].map((_, index) => (
                                <button 
                                    key={`bun-${index}`} 
                                    className={`${styles.bunBtn} ${!visibleBuns[index] ? styles.hidden : ''}`} 
                                    onClick={() => handleBunClick(index)}
                                    style={{ visibility: visibleBuns[index] ? 'visible' : 'hidden' }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Tabla de cortar (DERECHA) */}
                    <div className={styles.cuttingBoard}>
                        <div className={styles.label}>TABLA DE ARMADO</div>
                        <div className={styles.boardSurface}>
                            {activeHamburger ? (
                                <canvas 
                                    ref={canvasRef} 
                                    className={styles.hamburgerCanvas}
                                />
                            ) : (
                                <div className={styles.emptyBoard}>
                                    <p>Selecciona un pan para comenzar</p>
                                </div>
                            )}
                        </div>
                    </div>
               </div>
            </div>
        </div>
    )
}