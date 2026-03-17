import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCashRegister, FaChartLine, FaPizzaSlice } from 'react-icons/fa';
import { AppContext } from '../store/AppContext';
import { calculateCartPizzas } from '../utils/sales';

const Navbar = () => {
    const location = useLocation();
    const { store } = useContext(AppContext);
    const pizzasInCart = calculateCartPizzas(store.cart);

    const navItems = [
        { to: '/', label: 'Mostrador', icon: <FaCashRegister /> },
        { to: '/tesoreria', label: 'Tesoreria', icon: <FaChartLine /> },
    ];

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/10 bg-surface/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">WapaPizzasParty</p>
                    <h1 className="mt-1 text-xl font-semibold text-text">Panel de pedidos y tesoreria</h1>
                </div>

                <nav className="flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 p-1 shadow-modern">
                    {navItems.map((item) => {
                        const active = item.to === location.pathname;

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                                    active
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-muted hover:bg-primary/10 hover:text-primary'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden items-center gap-3 rounded-2xl border border-primary/15 bg-white/80 px-4 py-2 shadow-modern md:flex">
                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                        <FaPizzaSlice />
                    </span>
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted">Pedido actual</p>
                        <p className="text-sm font-semibold text-text">{pizzasInCart} pizzas cargadas</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
