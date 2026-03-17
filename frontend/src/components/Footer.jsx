import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Footer.module.css';

const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="bg-card text-text text-center py-4">
            <p>© {new Date().getFullYear()} Pizzería by ZeqeDev. <br /> Todos los derechos reservados.</p>
            <p
                className={`${styles.ZeqeDev} text-right text-white font-extrabold cursor-pointer`}
                onClick={() => navigate('/about-me')}
            >
                About Me!
            </p>
        </footer>
    );
};

export default Footer;
