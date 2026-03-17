import React from 'react';
import { FaLinkedin, FaInstagram, FaGithub, FaWhatsapp } from 'react-icons/fa';
import ZeqeIMG from '../img/ZeqeGitHub.png';
import styles from '../styles/AboutMe.module.css';

const AboutMe = () => {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Sobre mi</h1>
            <div className={styles.imgContainer}>
                <img src={ZeqeIMG} alt="ZeqeDev" className={styles.profileImage} />
            </div>
            <p className={styles.description}>
                Hola, soy Zeqe, desarrollador full stack con pasion por la tecnologia, la programacion y la innovacion.
                <br />
                Aca podes encontrarme en mis redes sociales:
            </p>
            <div className={styles.socialLinks}>
                <a href="https://www.linkedin.com/in/ezebellino" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <FaLinkedin className={styles.icon} /> Linkedin
                </a>
                <br />
                <a href="https://www.instagram.com/ezequielbellino/" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <FaInstagram className={styles.icon} /> Instagram
                </a>
                <br />
                <a href="https://github.com/ezebellino/" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <FaGithub className={styles.icon} /> Github
                </a>
                <br />
                <a href="https://wa.me/542245506008" target="_blank" rel="noopener noreferrer" className={styles.link}>
                    <FaWhatsapp className={styles.icon} /> Whatsapp
                </a>
            </div>
        </div>
    );
};

export default AboutMe;
