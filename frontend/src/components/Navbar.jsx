import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCashRegister, FaChartLine, FaPizzaSlice, FaSignOutAlt } from 'react-icons/fa';
import { AppContext } from '../store/AppContext';
import { calculateCartPizzas, formatPizzaQuantity } from '../utils/sales';

const Navbar = () => {
    const location = useLocation();
    const { store, actions } = useContext(AppContext);
    const pizzasInCart = calculateCartPizzas(store.cart);

    const navItems = [
        { to: '/', label: 'Mostrador', icon: <FaCashRegister />, roles: ['admin', 'operator'] },
        { to: '/tesoreria', label: 'Tesoreria', icon: <FaChartLine />, roles: ['admin'] },
    ].filter((item) => store.session.role && item.roles.includes(store.session.role));

    return (
        <header className="fixed inset-x-0 top-0 z-50 border-b border-primary/10 bg-surface/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">WapaPizzasParty</p>
                    <h1 className="mt-1 text-xl font-semibold text-text">Panel de pedidos y tesoreria</h1>
                </div>

                {store.session.isAuthenticated ? (
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
                ) : (
                    <div className="rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-sm font-medium text-muted shadow-modern">
                        Inicia sesion para continuar
                    </div>
                )}

                <div className="hidden items-center gap-3 md:flex">
                    {store.session.isAuthenticated ? (
                        <>
                            <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-white/80 px-4 py-2 shadow-modern">
                                <span className="rounded-full bg-primary/10 p-2 text-primary">
                                    <FaPizzaSlice />
                                </span>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted">Pedido actual</p>
                                    <p className="text-sm font-semibold text-text">{formatPizzaQuantity(pizzasInCart)} cargadas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-white/80 px-4 py-2 shadow-modern">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-muted">Sesion</p>
                                    <p className="text-sm font-semibold capitalize text-text">{store.session.name}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={actions.logout}
                                    className="rounded-full bg-background p-3 text-muted hover:text-primary"
                                >
                                    <FaSignOutAlt />
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
