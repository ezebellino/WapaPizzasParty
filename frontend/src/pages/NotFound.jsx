import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="rounded-[28px] border border-primary/10 bg-white/85 p-10 text-center shadow-modern">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">404</p>
            <h2 className="mt-3 text-3xl font-semibold text-text">La vista que buscas no existe</h2>
            <p className="mt-3 text-sm text-muted">Volvamos al panel principal para seguir trabajando.</p>
            <Link
                to="/"
                className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary"
            >
                Ir al mostrador
            </Link>
        </div>
    );
};

export default NotFound;
