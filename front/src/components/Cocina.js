"use client"

import { useState, useRef, useEffect } from "react"
import styles from "./Cocina.module.css"

//SECCIÓN DE LA COCINA DE HAMBURGUESAS
export default function Cocina({onGoToEntrega}) {
    const ingredientsBox = [
        {id:1, name:"Pan Abajo", image:"/imagenesHamburguesa/PanAbajoHamburguesa.png", type: "base", size: 200},
        {id:2, name:"Carne", image:"/imagenesHamburguesa/Carne.png", type: "ingredient", size: 180},
        {id:3, name:"Queso", image:"/imagenesHamburguesa/Queso.png", type: "ingredient", size: 180},
        {id:4, name:"Lechuga", image:"/imagenesHamburguesa/Lechuga.png", type: "ingredient", size: 180},
        {id:5, name:"Tomate", image:"/imagenesHamburguesa/Tomate.png", type: "ingredient", size: 180},
        {id:6, name:"Cebolla", image:"/imagenesHamburguesa/Cebolla.png", type: "ingredient", size: 180},
        {id:7, name:"Pan Arriba", image:"/imagenesHamburguesa/PanArribaHamburguesa.png", type: "top", size: 200},
        {id:8, name:"Panceta", image:"/imagenesHamburguesa/Panceta.png", type: "ingredient", size: 180},
    ]

    const [visibleBuns, setVisibleBuns] = useState([true, true, true, true, true, true, true, true])
    const [visiblePatties, setVisiblePatties] = useState([true, true, true, true, true, true, true, true])
    const [activeHamburger, setActiveHamburger] = useState(false)
    const [hamburgerLayers, setHamburgerLayers] = useState([])
    const [savedHamburgerImage, setSavedHamburgerImage] = useState(null)

    const canvasRef = useRef(null)
    const layerHeight = useRef(30) // Altura de cada capa

    // Configurar canvas cuando aparece la hamburguesa
    useEffect(() => {
        if (activeHamburger && canvasRef.current) {
            const canvas = canvasRef.current
            canvas.width = 400
            canvas.height = 500
            
            const ctx = canvas.getContext('2d')
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

        // Dibujar cada capa desde abajo hacia arriba
        hamburgerLayers.forEach((layer, index) => {
            if (layer.image.complete) {
                const yPosition = canvas.height - 50 - (index * layerHeight.current)
                const xPosition = (canvas.width - layer.size) / 2
                ctx.drawImage(layer.image, xPosition, yPosition, layer.size, layer.size)
            }
        })
    }

    const handleBunClick = (index) => {
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
        
        console.log(`Ingrediente ${ingredient.name} clickeado`)
        addIngredientToHamburger(ingredient)
    }

    const addIngredientToHamburger = (ingredient) => {
        const img = new Image()
        img.onload = () => {
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
            console.error(`Error cargando imagen: ${ingredient.image}`)
        }
        img.src = ingredient.image
    }

    const handleGoToOven = () => {
        const canvas = canvasRef.current
        if (!canvas) {
            alert("No hay hamburguesa para cocinar")
            return
        }

        if (hamburgerLayers.length === 0) {
            alert("¡Debes agregar ingredientes a tu hamburguesa!")
            return
        }

        try {
            const pngData = canvas.toDataURL('image/png')
            setSavedHamburgerImage(pngData)
            console.log("Hamburguesa guardada exitosamente")

            if (onGoToEntrega) {
                onGoToEntrega(pngData)
            } else {
                console.error("onGoToEntrega no está definida")
            }
        } catch (error) {
            console.error("Error al guardar la hamburguesa: ", error)
        }
    }

    const handleResetHamburger = () => {
        setHamburgerLayers([])
        setActiveHamburger(false)
        setVisibleBuns([true, true, true, true, true, true, true, true])
        setVisiblePatties([true, true, true, true, true, true, true, true])
        
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div className={styles.percent}></div>
                    <div className={styles.order}></div>
                    <div className={styles.time}></div>
                </div>
                
                <div className={styles.ingredientsBox}>
                    {ingredientsBox.slice(2).map((ingredientBox) => (
                        <button 
                            key={ingredientBox.id} 
                            className={styles.ingredientBtn} 
                            onClick={() => handleIngredientClick(ingredientBox)} 
                            title={ingredientBox.name}
                            disabled={!activeHamburger}
                        >
                            <img src={ingredientBox.image} alt={ingredientBox.name}></img>
                        </button>
                    ))}
                </div>

                <div className={styles.mainArea}>
                    <div className={styles.cookingZone}>
                        <div className={styles.pattiesContainer}>
                            {[...Array(8)].map((_, index) => (
                                <button 
                                    key={`patty-${index}`} 
                                    className={`${styles.pattyBtn} ${!visiblePatties[index] ? styles.hidden : ''}`} 
                                    onClick={() => handlePattyClick(index)}
                                    style={{ visibility: visiblePatties[index] ? 'visible' : 'hidden' }}
                                >
                                </button>
                            ))}
                        </div>

                        <div className={styles.bunsContainer}>
                            {[...Array(8)].map((_, index) => (
                                <button 
                                    key={`bun-${index}`} 
                                    className={`${styles.bunBtn} ${!visibleBuns[index] ? styles.hidden : ''}`} 
                                    onClick={() => handleBunClick(index)}
                                    style={{ visibility: visibleBuns[index] ? 'visible' : 'hidden' }}
                                >
                                </button>
                            ))}
                        </div>

                        <div className={styles.cuttingBoard}>
                            {activeHamburger && (
                                <canvas 
                                    ref={canvasRef} 
                                    className={styles.hamburgerCanvas}
                                ></canvas>
                            )}
                        </div>
                    </div>

                    <div className={styles.btns}>
                        <button className={styles.reset} onClick={handleResetHamburger}>
                            Reiniciar
                        </button>
                        <button className={styles.bake} onClick={handleGoToOven}>
                            Cocinar
                        </button>
                    </div>
                </div>
            </div>

            {savedHamburgerImage && (
                <div style={{ marginTop: '20px', padding: '10px', border: '1px solid green' }}>
                    <h3>Hamburguesa guardada:</h3>
                    <img 
                        src={savedHamburgerImage} 
                        alt="Hamburguesa guardada" 
                        style={{ maxWidth: '200px', border: '1px solid black' }}
                    ></img>
                </div>
            )}
        </>
    )
}