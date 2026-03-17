import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { FaMinus, FaPlus, FaReceipt, FaStoreSlash, FaTruck } from 'react-icons/fa';
import { AppContext } from '../store/AppContext';
import {
    ORDER_STATUS_OPTIONS,
    buildOpenOrders,
    buildStockAlerts,
    buildTreasuryStats,
    calculateCartPizzas,
    calculateCartSubtotal,
    calculateCartTotal,
    formatCurrency,
    getStatusBadgeClass,
    getStockBadgeClass,
    getStockLabel,
} from '../utils/sales';

const paymentOptions = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'mercado_pago', label: 'Mercado Pago' },
];

const Home = () => {
    const { store, actions } = useContext(AppContext);
    const [search, setSearch] = useState('');

    useEffect(() => {
        actions.loadPizzas();
        actions.loadSales();
    }, [actions]);

    const filteredPizzas = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) {
            return store.pizzas;
        }

        return store.pizzas.filter((pizza) => {
            const fullText = `${pizza.name} ${pizza.description}`.toLowerCase();
            return fullText.includes(term);
        });
    }, [search, store.pizzas]);

    const today = new Date().toISOString().split('T')[0];
    const todaySales = store.sales.find((day) => day.date === today);
    const openOrders = buildOpenOrders(store.sales).slice(0, 5);
    const stockAlerts = buildStockAlerts(store.pizzas);
    const treasuryStats = buildTreasuryStats(store.sales);
    const subtotal = calculateCartSubtotal(store.cart);
    const pizzasCount = calculateCartPizzas(store.cart);
    const shippingCost = Number(store.orderForm.shippingCost) || 0;
    const total = calculateCartTotal(store.cart, store.orderForm.includeShipping, shippingCost);

    const handleSubmitOrder = async () => {
        const result = await actions.confirmarVenta();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Pedido guardado',
                text: `${result.order.receiver_name} debe abonar ${formatCurrency(result.order.total)}.`,
                confirmButtonText: 'Seguir cargando',
            });
        }
    };

    const metricCards = [
        {
            label: 'Pedidos de hoy',
            value: todaySales?.order_count ?? 0,
            helper: 'Ordenes registradas hoy',
        },
        {
            label: 'Pizzas vendidas hoy',
            value: todaySales?.total_pizzas ?? 0,
            helper: 'Produccion acumulada del dia',
        },
        {
            label: 'Alertas de stock',
            value: stockAlerts.length,
            helper: 'Productos a revisar',
        },
    ];

    return (
        <div className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
                <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Mostrador</p>
                            <h2 className="mt-2 text-3xl font-semibold text-text">Carga rapida de pedidos</h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted">
                                Toma pedidos rapido, calcula el total automaticamente y controla pedidos y stock en una sola vista.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-secondary">
                            <p className="font-semibold">Pedido actual</p>
                            <p>{pizzasCount} pizzas - {formatCurrency(total)}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        {metricCards.map((card) => (
                            <div key={card.label} className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                                <p className="text-sm text-muted">{card.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-text">{card.value}</p>
                                <p className="mt-1 text-xs uppercase tracking-wide text-muted">{card.helper}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[28px] border border-primary/10 bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-modern">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/80">Operacion</p>
                    <h2 className="mt-3 text-2xl font-semibold">Panel liviano y util</h2>
                    <p className="mt-3 text-sm text-white/80">
                        Mas control del negocio: pedidos activos, disponibilidad y alertas para no vender de mas.
                    </p>
                    <div className="mt-6 rounded-2xl bg-white/10 p-4">
                        <p className="text-sm text-white/80">Facturacion acumulada</p>
                        <p className="mt-2 text-3xl font-semibold">{formatCurrency(treasuryStats.totalRevenue)}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
                <div className="space-y-4 rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-2xl font-semibold text-text">Catalogo de pizzas</h3>
                            <p className="text-sm text-muted">Busca rapido, controla stock y agrega al pedido.</p>
                        </div>
                        <input
                            type="search"
                            placeholder="Buscar pizza..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary md:max-w-xs"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {store.pizzasLoading ? (
                            <p className="text-sm text-muted">Cargando catalogo...</p>
                        ) : filteredPizzas.length > 0 ? (
                            filteredPizzas.map((pizza) => (
                                <article
                                    key={pizza.id}
                                    className={`flex h-full flex-col rounded-3xl border p-5 transition ${
                                        pizza.available && pizza.stock > 0
                                            ? 'border-primary/10 bg-surface hover:-translate-y-0.5 hover:shadow-modern'
                                            : 'border-dashed border-primary/20 bg-background/70 opacity-80'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-xl font-semibold text-text">{pizza.name}</h4>
                                                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getStockBadgeClass(pizza)}`}>
                                                    {getStockLabel(pizza)}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-muted">{pizza.description}</p>
                                        </div>
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                            {formatCurrency(pizza.price)}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() => actions.addToCart(pizza)}
                                            disabled={!pizza.available || pizza.stock === 0}
                                            className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:bg-muted/40"
                                        >
                                            {pizza.available && pizza.stock > 0 ? 'Agregar al pedido' : 'Sin stock'}
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    actions.updatePizzaInventory(pizza.id, {
                                                        stock: Math.max(0, pizza.stock - 1),
                                                    })
                                                }
                                                className="rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                                            >
                                                -1 stock
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    actions.updatePizzaInventory(pizza.id, {
                                                        stock: pizza.stock + 1,
                                                    })
                                                }
                                                className="rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                                            >
                                                +1 stock
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <p className="text-sm text-muted">No encontramos pizzas con ese criterio.</p>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <aside className="rounded-[28px] border border-primary/10 bg-white/90 p-6 shadow-modern">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Pedido</p>
                                <h3 className="mt-2 text-2xl font-semibold text-text">Caja y entrega</h3>
                            </div>
                            <span className="rounded-full bg-accent/15 p-3 text-accent">
                                <FaReceipt />
                            </span>
                        </div>

                        <div className="mt-5 space-y-4">
                            <input
                                type="text"
                                placeholder="Quien recibe la pizza"
                                value={store.orderForm.receiverName}
                                onChange={(event) => actions.setOrderField('receiverName', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                            <input
                                type="text"
                                placeholder="Telefono de contacto"
                                value={store.orderForm.receiverPhone}
                                onChange={(event) => actions.setOrderField('receiverPhone', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                            <select
                                value={store.orderForm.paymentMethod}
                                onChange={(event) => actions.setOrderField('paymentMethod', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            >
                                {paymentOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            <label className="flex items-center justify-between rounded-2xl border border-primary/10 bg-background/70 px-4 py-3 text-sm text-text">
                                <span className="flex items-center gap-2 font-medium">
                                    <FaTruck className="text-primary" />
                                    Incluir envio
                                </span>
                                <input
                                    type="checkbox"
                                    checked={store.orderForm.includeShipping}
                                    onChange={actions.toggleShipping}
                                    className="h-4 w-4 rounded border-primary/30 text-primary focus:ring-primary"
                                />
                            </label>

                            {store.orderForm.includeShipping ? (
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Costo de envio"
                                    value={store.orderForm.shippingCost}
                                    onChange={(event) => actions.setOrderField('shippingCost', event.target.value)}
                                    className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                                />
                            ) : null}

                            <textarea
                                rows="3"
                                placeholder="Observaciones del pedido"
                                value={store.orderForm.notes}
                                onChange={(event) => actions.setOrderField('notes', event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-text">Detalle</h4>
                                <span className="text-sm text-muted">{pizzasCount} pizzas</span>
                            </div>

                            <div className="max-h-80 space-y-3 overflow-auto pr-1">
                                {store.cart.length > 0 ? (
                                    store.cart.map((item) => (
                                        <div key={item.id} className="rounded-2xl border border-primary/10 bg-background/70 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-semibold text-text">{item.name}</p>
                                                    <p className="text-sm text-muted">{formatCurrency(item.price)} por unidad</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => actions.removeFromCart(item.id)}
                                                    className="text-xs font-semibold uppercase tracking-wide text-secondary hover:text-primary"
                                                >
                                                    Quitar
                                                </button>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-2 py-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => actions.decrementCartItem(item.id)}
                                                        className="rounded-full bg-background p-2 text-text hover:bg-primary/10"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="min-w-8 text-center font-semibold text-text">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => actions.incrementCartItem(item.id)}
                                                        className="rounded-full bg-background p-2 text-text hover:bg-primary/10"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                                <span className="font-semibold text-text">
                                                    {formatCurrency(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-primary/20 bg-background/60 p-5 text-sm text-muted">
                                        Agrega pizzas desde el catalogo para empezar a cargar el pedido.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 space-y-3 rounded-3xl bg-background p-5">
                            <div className="flex items-center justify-between text-sm text-muted">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted">
                                <span>Envio</span>
                                <span>{store.orderForm.includeShipping ? formatCurrency(shippingCost) : formatCurrency(0)}</span>
                            </div>
                            <div className="flex items-center justify-between border-t border-primary/10 pt-3 text-lg font-semibold text-text">
                                <span>Total a cobrar</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {store.lastCreatedOrder ? (
                            <div className="mt-4 rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                                Ultimo pedido guardado: {store.lastCreatedOrder.receiver_name} - {formatCurrency(store.lastCreatedOrder.total)}
                            </div>
                        ) : null}

                        {store.appError ? (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                {store.appError}
                            </div>
                        ) : null}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={actions.clearOrderDraft}
                                className="rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                            >
                                Limpiar
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmitOrder}
                                disabled={store.submittingOrder}
                                className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {store.submittingOrder ? 'Guardando...' : 'Registrar pedido'}
                            </button>
                        </div>
                    </aside>

                    <section className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-semibold text-text">Alertas de stock</h3>
                                <p className="text-sm text-muted">Productos sin stock o cerca de agotarse.</p>
                            </div>
                            <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold text-primary">
                                {stockAlerts.length}
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {stockAlerts.length > 0 ? (
                                stockAlerts.slice(0, 5).map((pizza) => (
                                    <div key={pizza.id} className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-text">{pizza.name}</p>
                                                <p className="text-sm text-muted">Umbral: {pizza.low_stock_threshold} unidades</p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockBadgeClass(pizza)}`}>
                                                {getStockLabel(pizza)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-primary/20 bg-background/60 p-5 text-sm text-muted">
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-primary/10 p-3 text-primary">
                                            <FaStoreSlash />
                                        </span>
                                        <span>No hay alertas de stock en este momento.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-semibold text-text">Pedidos activos</h3>
                                <p className="text-sm text-muted">Pendientes o en preparacion para seguimiento rapido.</p>
                            </div>
                            <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold text-primary">
                                {openOrders.length}
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {openOrders.length > 0 ? (
                                openOrders.map((order) => (
                                    <div key={order.order_id} className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-text">{order.receiver_name}</p>
                                                <p className="text-sm text-muted">
                                                    {order.date} - {order.sales.reduce((sum, item) => sum + item.quantity, 0)} pizzas
                                                </p>
                                            </div>
                                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                                {ORDER_STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm font-medium text-text">{formatCurrency(order.total)}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-primary/20 bg-background/60 p-5 text-sm text-muted">
                                    <div className="flex items-center gap-3">
                                        <span className="rounded-full bg-primary/10 p-3 text-primary">
                                            <FaStoreSlash />
                                        </span>
                                        <span>No hay pedidos activos en este momento.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
};

export default Home;
