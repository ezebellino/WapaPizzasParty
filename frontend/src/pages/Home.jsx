import React from 'react';
import { useNavigate } from 'react-router-dom';
import img3 from '../img/wapaCostado.jpg';
import styles from '../styles/Home.module.css';

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
                <h1>Bienvenido a WapaPizzaParty</h1>
                <p className={styles.parrafoHome}>Explora nuestra seleccion de pizzas listas para cada evento.</p>
                <p className={styles.parrafoHome}>Tambien tenemos pizza sin TACC.</p>
                <p className={styles.parrafoHome}>Hace tu pedido y disfruta de una experiencia unica.</p>
                <button className={styles.exploreButton} onClick={handleExploreProducts}>
                    Ver menu
                </button>
            </div>
        </div>
    );
};

export default Home;
