import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaChartLine } from 'react-icons/fa';
import styles from '../styles/Navbar.module.css';
import { AppContext } from '../store/AppContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { store } = useContext(AppContext);

    const getActiveClass = (path) =>
        path === location.pathname
            ? 'text-accent underline'
            : 'text-text hover:text-primary transition';

    return (
        <nav className={`${styles.Navbar} bg-card text-text shadow-modern`}>
            <div className="container mx-auto flex justify-between items-center p-4">
                <h2
                    className="text-lg font-bold text-primary"
                    style={{ fontSize: "25px", color: "goldenrod" }}
                >
                    W a p a P i z z a
                </h2>
                <div className="flex gap-4">
                    <Link to="/" className={`${styles.navButton} ${getActiveClass('/')}`}>
                        Inicio
                    </Link>
                    <Link to="/menu" className={`${styles.navButton} ${getActiveClass('/menu')}`}>
                        Pizzas
                    </Link>
                    <Link to="/about-us" className={`${styles.navButton} ${getActiveClass('/about-us')}`}>
                        Nosotros
                    </Link>
                    <Link to="/sales-history" className={`${styles.navButton} ${getActiveClass('/sales-history')}`}>
                        <FaChartLine className={`${styles.salesIcon} inline-block`} /> Ventas
                    </Link>
                    <div className={styles.navButton}>
                        <FaShoppingCart className={styles.navbarCartIcon} onClick={() => navigate('/cart')} />
                        {store.cart.length > 0 && (
                            <span className={styles.navbarCartBadge}>
                                {store.cart.length}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
