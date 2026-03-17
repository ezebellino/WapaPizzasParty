import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import logoImage from '../assets/WapaPizzaParty.jpeg';
import { diagnosticsConfigRequest } from '../api/auth';
import { AppContext } from '../store/AppContext';

const Login = () => {
    const navigate = useNavigate();
    const { store, actions } = useContext(AppContext);
    const [showManualLogin, setShowManualLogin] = useState(false);
    const [form, setForm] = useState({
        username: '',
        password: '',
    });

    useEffect(() => {
        diagnosticsConfigRequest()
            .then((config) => {
                setShowManualLogin(Boolean(config.show_manual_login));
            })
            .catch(() => {
                setShowManualLogin(false);
            });
    }, []);

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

    const handleLocalAccess = async () => {
        const success = await actions.localAccessLogin();
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="mx-auto max-w-md rounded-[28px] border border-primary/10 bg-white/90 p-8 shadow-modern">
            <div className="flex items-center gap-4">
                <img
                    src={logoImage}
                    alt="Logo WapaPizzaParty"
                    className="h-20 w-20 rounded-full border border-primary/15 object-cover shadow-modern"
                />
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Acceso</p>
                    <h2 className="mt-2 text-3xl font-semibold text-text">Ingresar a WapaPizzaParty</h2>
                </div>
            </div>
            <p className="mt-2 text-sm text-muted">
                Esta pantalla esta pensada para una sola PC del negocio, con acceso rapido directo al puesto.
            </p>

            <div className="mt-6 rounded-3xl border border-primary/10 bg-background/70 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Puesto local</p>
                <p className="mt-2 text-sm text-muted">
                    Si esta es la PC interna del negocio, puedes entrar con acceso rapido sin escribir usuario y contrasena.
                </p>
                <button
                    type="button"
                    onClick={handleLocalAccess}
                    className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                >
                    Ingresar al puesto
                </button>
            </div>

            {showManualLogin ? (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Ingreso manual</p>
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

                    <button
                        type="submit"
                        className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                    >
                        Ingresar manualmente
                    </button>
                </form>
            ) : (
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    El ingreso manual esta oculto para simplificar la operacion del puesto.
                </p>
            )}

            {store.appError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {store.appError}
                </div>
            ) : null}
        </div>
    );
};

export default Login;
