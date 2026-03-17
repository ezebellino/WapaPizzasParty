import React from 'react';
import { FaPhoneAlt, FaInstagram, FaMapMarkerAlt, FaFacebook } from 'react-icons/fa';
import styles from '../styles/AboutUs.module.css';

const AboutUs = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Nuestra Historia</h2>
            <p className={styles.description}>
                En Wapa Pizza Party, llevamos más de 15 años creando momentos únicos con nuestras exquisitas pizzas.
                Nuestra pasión por la calidad y el sabor nos ha convertido en una tradición para los amantes de la pizza.<br />
                Fundada por Sole Moran, Profesional Gastronómico #IAG, Wapa Pizza Party no tiene un local físico,
                pero cada fin de semana estamos presentes en los mejores eventos. <br />
                Desde cumpleaños hasta reuniones empresariales, nuestro servicio se adapta a cualquier tipo de festejo.
                ¡Vos poné el lugar, nosotros nos ocupamos del resto! <span className={styles.slogan}>#PizzaParty #ListasParaHornear</span><br />
                No importa la ocasión, cada bocado de nuestras pizzas está pensado para conquistar tus sentidos. <br />
                Así que, ¿qué esperás? ¡Probá nuestras pizzas y convertí tu próximo evento en una experiencia inolvidable!
            </p>
            <h3 className={styles.contactTitle}>Contáctanos al:</h3>
            <div className={styles.contact}>
                <a
                    href="tel:2245509530"
                    className={styles.iconLink}
                >
                    <FaPhoneAlt className={styles.icon} />
                    <span className={styles.text}>2245509530</span>
                </a>
                <a
                    href="https://www.instagram.com/wapapizzaparty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconLink}
                >
                    <FaInstagram className={styles.icon} />
                    <span className={styles.text}>@wapapizzaparty</span>
                </a>
                <a
                    href="https://www.facebook.com/SoleMoranWapaPizzaParty"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconLink}
                >
                    <FaFacebook className={styles.icon} />
                    <span className={styles.text}>Sole Moran - Wapa Pizza Party</span>
                </a>
                <a
                    href="https://www.google.com/maps/place/Dolores,+Buenos+Aires,+Argentina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.iconLink}
                >
                    <FaMapMarkerAlt className={styles.icon} />
                    <span className={styles.text}>Dolores, Buenos Aires, Argentina</span>
                </a>
            </div>
        </div>
    );
};

export default AboutUs;
