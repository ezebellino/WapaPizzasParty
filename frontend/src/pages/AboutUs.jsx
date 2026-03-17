import React from 'react';
import { FaPhoneAlt, FaInstagram, FaMapMarkerAlt, FaFacebook } from 'react-icons/fa';
import styles from '../styles/AboutUs.module.css';

const AboutUs = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Nuestra Historia</h2>
            <p className={styles.description}>
                En Wapa Pizza Party, llevamos mas de 15 anos creando momentos unicos con nuestras pizzas.
                Nuestra pasion por la calidad y el sabor nos convirtio en una tradicion para quienes aman compartir una buena pizza.
                <br />
                Fundada por Sole Moran, profesional gastronomica del IAG, Wapa Pizza Party no tiene un local fisico,
                pero cada fin de semana estamos presentes en los mejores eventos.
                <br />
                Desde cumpleanos hasta reuniones empresariales, nuestro servicio se adapta a cualquier tipo de festejo.
                Vos pone el lugar, nosotros nos ocupamos del resto. <span className={styles.slogan}>#PizzaParty #ListasParaHornear</span>
                <br />
                No importa la ocasion, cada bocado de nuestras pizzas esta pensado para conquistar tus sentidos.
                <br />
                Proba nuestras pizzas y converti tu proximo evento en una experiencia inolvidable.
            </p>
            <h3 className={styles.contactTitle}>Contactanos en:</h3>
            <div className={styles.contact}>
                <a href="tel:2245509530" className={styles.iconLink}>
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
