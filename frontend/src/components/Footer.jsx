import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-primary/10 bg-surface/70">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <p>WapaPizzaParty · mostrador, pedidos y seguimiento diario de caja.</p>
                <p>Base actual: FastAPI + React + almacenamiento JSON.</p>
            </div>
        </footer>
    );
};

export default Footer;
