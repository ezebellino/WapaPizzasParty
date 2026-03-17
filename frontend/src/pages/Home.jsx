import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Home.module.css';
import img3 from '../img/wapaCostado.jpg';

const Home = () => {
    const navigate = useNavigate();

    const handleExploreProducts = () => {
        navigate('/menu');
    };

    return (
        <div className={styles.container}>
            <div className={styles.background}>
                <img src={img3} alt="Wapa Costado" className={styles.image} />
            </div>
            <div className={styles.content}>
                <h1>¡Bienvenido a WapaPizzaParty!</h1>
                <p className={styles.parrafoHome}>Explora nuestra selección de productos deliciosos.</p>
                <p className={styles.parrafoHome}>Tambien tenemos pizza sin TACC.</p>
                <p className={styles.parrafoHome}>¡Haz tu pedido y disfruta de una experiencia única!</p>
                <button
                    className={`${styles.exploreButton}`}
                    onClick={handleExploreProducts}
                >
                    Explorar Productos
                </button>
            </div>
        </div>
    );
};

export default Home;
