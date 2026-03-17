import React, { useContext, useEffect } from 'react';
import { AppContext } from '../store/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import styles from '../styles/Menu.module.css';

const Menu = () => {
    const { store, actions } = useContext(AppContext);

    useEffect(() => {
        actions.loadPizzas();
    }, [actions]);

    const handleAddToCart = (pizza) => {
        actions.addToCart({ ...pizza, quantity: 1 });
        Swal.fire({
            title: '¡Añadido al carrito!',
            text: `${pizza.name} ha sido agregado al carrito.`,
            icon: 'success',
            confirmButtonText: 'OK'
        });
    };

    return (
        <div className={`${styles.container}`}>
            <div className={styles.header}>
                <h1>Menú de Pizzas</h1>
            </div>
            <div className={styles.grid}>
                <AnimatePresence>
                    {store.pizzas && store.pizzas.length > 0 ? (
                        store.pizzas.map((pizza) => (
                            <motion.div
                                key={pizza.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className={styles.card}
                            >
                                <h3 className="text-lg font-semibold">{pizza.name}</h3>
                                <p>{pizza.description}</p>
                                <p className="text-primary font-bold">${pizza.price}</p>
                                <div className={styles.actions}>
                                    <button
                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        onClick={() => handleAddToCart(pizza)}
                                    >
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-white text-lg">Cargando pizzas...</p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Menu;
