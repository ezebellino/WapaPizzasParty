import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '../store/AppContext';
import { formatCurrency, formatStockValue, getStockBadgeClass, getStockLabel } from '../utils/sales';

const emptyPizzaForm = {
    name: '',
    description: '',
    price: '',
    stock: '',
    lowStockThreshold: '',
    available: true,
};

const CatalogEditor = () => {
    const { store, actions } = useContext(AppContext);
    const [selectedPizzaId, setSelectedPizzaId] = useState(null);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState(emptyPizzaForm);

    useEffect(() => {
        actions.loadPizzas();
    }, [actions]);

    const filteredPizzas = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) {
            return store.pizzas;
        }

        return store.pizzas.filter((pizza) => `${pizza.name} ${pizza.description}`.toLowerCase().includes(term));
    }, [search, store.pizzas]);

    const selectedPizza = selectedPizzaId
        ? store.pizzas.find((pizza) => pizza.id === selectedPizzaId) ?? null
        : null;

    const syncFormWithPizza = (pizza) => {
        if (!pizza) {
            setForm(emptyPizzaForm);
            return;
        }

        setForm({
            name: pizza.name,
            description: pizza.description,
            price: String(pizza.price),
            stock: String(pizza.stock),
            lowStockThreshold: String(pizza.low_stock_threshold),
            available: pizza.available,
        });
    };

    const handleSelectPizza = (pizza) => {
        setSelectedPizzaId(pizza.id);
        syncFormWithPizza(pizza);
    };

    const handleNewPizza = () => {
        setSelectedPizzaId(null);
        setForm(emptyPizzaForm);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: form.name,
            description: form.description,
            price: Number(form.price),
            stock: Number(form.stock),
            low_stock_threshold: Number(form.lowStockThreshold),
            available: form.available,
        };

        const result = await actions.savePizzaCatalog(selectedPizzaId, payload);
        if (!result.success) {
            return;
        }

        setSelectedPizzaId(result.pizza.id);
        syncFormWithPizza(result.pizza);

        await Swal.fire({
            icon: 'success',
            title: selectedPizzaId ? 'Pizza actualizada' : 'Pizza creada',
            text: `${result.pizza.name} ya quedo guardada en el catalogo.`,
            confirmButtonText: 'Continuar',
        });
    };

    return (
        <div className="space-y-8">
            <section className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Catalogo</p>
                        <h2 className="mt-2 text-3xl font-semibold text-text">Editor de pizzas</h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted">
                            Desde aqui puedes crear sabores nuevos, cambiar precios, ajustar stock y marcar disponibilidad sin tocar archivos JSON.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <input
                            type="search"
                            placeholder="Buscar pizza..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary md:w-72"
                        />
                        <button
                            type="button"
                            onClick={handleNewPizza}
                            className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                        >
                            Nueva pizza
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-semibold text-text">Pizzas cargadas</h3>
                            <p className="text-sm text-muted">Selecciona una para editar o crea una nueva.</p>
                        </div>
                        <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold text-primary">
                            {filteredPizzas.length}
                        </span>
                    </div>

                    <div className="mt-5 grid gap-3">
                        {store.pizzasLoading ? (
                            <p className="text-sm text-muted">Cargando catalogo...</p>
                        ) : filteredPizzas.length > 0 ? (
                            filteredPizzas.map((pizza) => {
                                const selected = pizza.id === selectedPizzaId;

                                return (
                                    <button
                                        key={pizza.id}
                                        type="button"
                                        onClick={() => handleSelectPizza(pizza)}
                                        className={`rounded-3xl border p-4 text-left transition ${
                                            selected
                                                ? 'border-primary bg-primary/5 shadow-modern'
                                                : 'border-primary/10 bg-background/60 hover:border-primary/20 hover:bg-white'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-lg font-semibold text-text">{pizza.name}</p>
                                                <p className="mt-1 text-sm text-muted">{pizza.description}</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockBadgeClass(pizza)}`}>
                                                {getStockLabel(pizza)}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                                            <span>{formatCurrency(pizza.price)}</span>
                                            <span>Stock: {formatStockValue(pizza.stock)}</span>
                                            <span>Minimo: {formatStockValue(pizza.low_stock_threshold)}</span>
                                            <span>{pizza.available ? 'Disponible' : 'Oculta'}</span>
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted">No hay pizzas que coincidan con esa busqueda.</p>
                        )}
                    </div>
                </div>

                <aside className="rounded-[28px] border border-primary/10 bg-white/90 p-6 shadow-modern">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                            {selectedPizza ? `Editando #${selectedPizza.id}` : 'Alta nueva'}
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-text">
                            {selectedPizza ? selectedPizza.name : 'Nueva pizza'}
                        </h3>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Nombre de la pizza"
                            value={form.name}
                            onChange={(event) => handleChange('name', event.target.value)}
                            className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                        />
                        <textarea
                            rows="4"
                            placeholder="Descripcion"
                            value={form.description}
                            onChange={(event) => handleChange('description', event.target.value)}
                            className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                        />
                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                type="number"
                                min="1"
                                placeholder="Precio"
                                value={form.price}
                                onChange={(event) => handleChange('price', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Stock actual"
                                value={form.stock}
                                onChange={(event) => handleChange('stock', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Stock minimo"
                                value={form.lowStockThreshold}
                                onChange={(event) => handleChange('lowStockThreshold', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                            <label className="flex items-center justify-between rounded-2xl border border-primary/10 bg-background/70 px-4 py-3 text-sm text-text">
                                <span className="font-medium">Disponible para vender</span>
                                <input
                                    type="checkbox"
                                    checked={form.available}
                                    onChange={(event) => handleChange('available', event.target.checked)}
                                    className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
                                />
                            </label>
                        </div>

                        {store.appError ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {store.appError}
                            </div>
                        ) : null}

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={handleNewPizza}
                                className="rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                            >
                                Limpiar formulario
                            </button>
                            <button
                                type="submit"
                                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                            >
                                {selectedPizza ? 'Guardar cambios' : 'Crear pizza'}
                            </button>
                        </div>
                    </form>
                </aside>
            </section>
        </div>
    );
};

export default CatalogEditor;
