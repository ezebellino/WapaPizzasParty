import React, { useContext, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppContext } from '../store/AppContext';

const Login = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(AppContext);
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    if (store.session.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        const success = await actions.login(form);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="mx-auto max-w-md rounded-[28px] border border-primary/10 bg-white/90 p-8 shadow-modern">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Acceso</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">Ingresar al panel</h2>
            <p className="mt-2 text-sm text-muted">
                Usa las credenciales creadas por administracion para entrar segun tu rol operativo.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Usuario"
                    value={form.username}
                    onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                    className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                />
                <input
                    type="password"
                    placeholder="Contrasena"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                />

                {store.appError ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {store.appError}
                    </div>
                ) : null}

                <button
                    type="submit"
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                >
                    Ingresar
                </button>
            </form>
        </div>
    );
};

export default Login;
