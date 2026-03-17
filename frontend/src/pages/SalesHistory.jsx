import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../store/AppContext';
import {
    ORDER_STATUS_OPTIONS,
    buildStockAlerts,
    buildTopProducts,
    buildTreasuryStats,
    formatCurrency,
    getStatusBadgeClass,
    getStockBadgeClass,
    getStockLabel,
} from '../utils/sales';

const SalesHistory = () => {
    const { store, actions } = useContext(AppContext);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        actions.loadSales();
        actions.loadPizzas();
    }, [actions]);

    const filteredDays = useMemo(() => {
        if (!selectedDate) {
            return store.sales;
        }

        return store.sales.filter((day) => day.date === selectedDate);
    }, [selectedDate, store.sales]);

    const stats = buildTreasuryStats(filteredDays);
    const topProducts = buildTopProducts(filteredDays).slice(0, 5);
    const stockAlerts = buildStockAlerts(store.pizzas).slice(0, 6);
    const recentOrders = [...stats.orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

    const dailyRows = [...filteredDays].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="space-y-8">
            <section className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Tesoreria</p>
                        <h2 className="mt-2 text-3xl font-semibold text-text">Seguimiento de ventas y ganancias</h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted">
                            Consulta pedidos registrados, facturacion, volumen de pizzas, ranking y alertas de inventario.
                        </p>
                    </div>

                    <div className="w-full max-w-xs">
                        <label className="mb-2 block text-sm font-medium text-muted">Filtrar por fecha</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(event) => setSelectedDate(event.target.value)}
                            className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                        />
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Ventas registradas</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{stats.totalOrders}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Pizzas vendidas</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{stats.totalPizzas}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Facturacion</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Ticket promedio</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{formatCurrency(stats.averageTicket)}</p>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <h3 className="text-2xl font-semibold text-text">Resumen diario</h3>
                    <p className="mt-1 text-sm text-muted">Control rapido por fecha para caja y produccion.</p>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-primary/10">
                        <table className="min-w-full divide-y divide-primary/10 text-sm">
                            <thead className="bg-background/80">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-muted">Fecha</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted">Pedidos</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted">Pizzas</th>
                                    <th className="px-4 py-3 text-left font-semibold text-muted">Facturacion</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary/10 bg-white">
                                {store.salesLoading ? (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-muted">
                                            Cargando movimientos...
                                        </td>
                                    </tr>
                                ) : dailyRows.length > 0 ? (
                                    dailyRows.map((day) => (
                                        <tr key={day.date}>
                                            <td className="px-4 py-3 font-medium text-text">{day.date}</td>
                                            <td className="px-4 py-3 text-muted">{day.order_count}</td>
                                            <td className="px-4 py-3 text-muted">{day.total_pizzas}</td>
                                            <td className="px-4 py-3 font-semibold text-text">{formatCurrency(day.total_revenue)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-6 text-center text-muted">
                                            No hay ventas registradas para este filtro.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <h3 className="text-2xl font-semibold text-text">Alertas de stock</h3>
                        <div className="mt-5 space-y-3">
                            {stockAlerts.length > 0 ? (
                                stockAlerts.map((pizza) => (
                                    <div key={pizza.id} className="flex items-center justify-between rounded-2xl bg-background/70 p-4">
                                        <div>
                                            <p className="font-semibold text-text">{pizza.name}</p>
                                            <p className="text-sm text-muted">Umbral minimo: {pizza.low_stock_threshold}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStockBadgeClass(pizza)}`}>
                                            {getStockLabel(pizza)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted">No hay alertas de stock por ahora.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <h3 className="text-2xl font-semibold text-text">Productos mas vendidos</h3>
                        <div className="mt-5 space-y-3">
                            {topProducts.length > 0 ? (
                                topProducts.map((product, index) => (
                                    <div key={product.id} className="flex items-center justify-between rounded-2xl bg-background/70 p-4">
                                        <div>
                                            <p className="text-sm uppercase tracking-wide text-muted">#{index + 1}</p>
                                            <p className="font-semibold text-text">{product.name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-text">{product.quantity} pizzas</p>
                                            <p className="text-sm text-muted">{formatCurrency(product.revenue)}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted">Todavia no hay datos para armar ranking.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <h3 className="text-2xl font-semibold text-text">Ultimos pedidos</h3>
                        <div className="mt-5 space-y-3">
                            {recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <div key={order.order_id} className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-text">{order.receiver_name}</p>
                                                <p className="text-sm text-muted">{order.date} - {order.payment_method}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                                    {ORDER_STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status}
                                                </span>
                                                <p className="mt-2 text-sm font-semibold text-text">{formatCurrency(order.total)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <p className="text-sm text-muted">
                                                {order.sales.reduce((sum, item) => sum + item.quantity, 0)} pizzas - {order.include_shipping ? 'con envio' : 'sin envio'}
                                            </p>
                                            <select
                                                value={order.status}
                                                onChange={(event) => actions.updateOrderStatus(order.date, order.order_id, event.target.value)}
                                                className="rounded-2xl border border-primary/15 bg-white px-4 py-2 text-sm text-text outline-none transition focus:border-primary"
                                            >
                                                {ORDER_STATUS_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted">Aun no hay pedidos para mostrar.</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SalesHistory;
