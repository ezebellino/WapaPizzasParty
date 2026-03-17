import React, { useContext, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { AppContext } from '../store/AppContext';
import {
    buildDailyPerformance,
    ORDER_STATUS_OPTIONS,
    buildPaymentBreakdown,
    buildStatusBreakdown,
    buildStockAlerts,
    buildTopProducts,
    buildTreasuryStats,
    downloadTreasuryCsv,
    formatCurrency,
    formatPizzaQuantity,
    formatSaleItemLabel,
    formatStockValue,
    getOrderAlertLabel,
    getStatusBadgeClass,
    getStockBadgeClass,
    getStockLabel,
    printKitchenTicket,
} from '../utils/sales';

const SalesHistory = () => {
    const { store, actions } = useContext(AppContext);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        actions.loadSales();
        actions.loadPizzas();
    }, [actions]);

    const filteredDays = useMemo(() => {
        return store.sales.filter((day) => {
            const matchesStart = !startDate || day.date >= startDate;
            const matchesEnd = !endDate || day.date <= endDate;
            return matchesStart && matchesEnd;
        });
    }, [endDate, startDate, store.sales]);

    const stats = buildTreasuryStats(filteredDays);
    const dailyPerformance = buildDailyPerformance(filteredDays);
    const topProducts = buildTopProducts(filteredDays).slice(0, 5);
    const stockAlerts = buildStockAlerts(store.pizzas).slice(0, 6);
    const paymentBreakdown = buildPaymentBreakdown(filteredDays);
    const statusBreakdown = buildStatusBreakdown(filteredDays);
    const recentOrders = [...stats.orders]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

    const dailyRows = [...filteredDays].sort((a, b) => b.date.localeCompare(a.date));
    const exportLabel = [startDate || 'inicio', endDate || 'hoy'].join('_a_');
    const maxRevenue = Math.max(...dailyPerformance.map((item) => item.revenue), 1);
    const maxPizzas = Math.max(...dailyPerformance.map((item) => item.pizzas), 1);

    const handleMarkReady = async (order) => {
        const result = await actions.markOrderReady(order.date, order.order_id);
        if (!result.success) {
            return;
        }

        const notificationText =
            result.notification === 'whatsapp'
                ? 'Se abrio el WhatsApp con el comprobante listo para enviar.'
                : result.notification === 'vipper'
                    ? `Llama el vipper ${result.order.vipper_code} para avisar que ya puede retirar.`
                    : 'El pedido quedo marcado como listo para retirar.';

        await Swal.fire({
            icon: 'success',
            title: 'Pedido listo',
            text: notificationText,
            confirmButtonText: 'Continuar',
        });
    };

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

                    <div className="grid w-full gap-3 md:max-w-xl md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-muted">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => setStartDate(event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-muted">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => setEndDate(event.target.value)}
                                className="w-full rounded-2xl border border-primary/15 bg-background px-4 py-3 text-sm text-text outline-none transition focus:border-primary"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="rounded-2xl border border-primary/15 bg-white px-4 py-3 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                        >
                            Limpiar filtro
                        </button>
                        <button
                            type="button"
                            onClick={() => downloadTreasuryCsv(filteredDays, exportLabel)}
                            className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-secondary"
                        >
                            Exportar CSV
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Ventas registradas</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{stats.totalOrders}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Pizzas vendidas</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{formatPizzaQuantity(stats.totalPizzas)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Facturacion</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Ticket promedio</p>
                        <p className="mt-2 text-3xl font-semibold text-text">{formatCurrency(stats.averageTicket)}</p>
                    </div>
                    <div className="rounded-2xl border border-primary/10 bg-background/60 p-4">
                        <p className="text-sm text-muted">Mejor dia</p>
                        <p className="mt-2 text-lg font-semibold text-text">{stats.bestDay?.date ?? 'Sin datos'}</p>
                        <p className="mt-1 text-sm text-muted">
                            {stats.bestDay ? formatCurrency(stats.bestDay.total_revenue) : 'Aun sin ventas'}
                        </p>
                    </div>
                </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-semibold text-text">Facturacion por dia</h3>
                            <p className="text-sm text-muted">Rango actual de ventas del periodo seleccionado.</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {dailyPerformance.length > 0 ? (
                            dailyPerformance.map((item) => (
                                <div key={item.date} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-text">{item.date}</span>
                                        <span className="text-muted">{formatCurrency(item.revenue)}</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-background">
                                        <div
                                            className="h-3 rounded-full bg-primary"
                                            style={{ width: `${Math.max((item.revenue / maxRevenue) * 100, 6)}%` }}
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted">No hay datos en el rango elegido.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-semibold text-text">Produccion por dia</h3>
                            <p className="text-sm text-muted">Cantidad de pizzas y pedidos registrados por jornada.</p>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        {dailyPerformance.length > 0 ? (
                            dailyPerformance.map((item) => (
                                <div key={item.date} className="rounded-2xl bg-background/70 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-text">{item.date}</span>
                                        <span className="text-sm text-muted">{item.orders} pedidos</span>
                                    </div>
                                    <div className="mt-3 h-3 rounded-full bg-white">
                                        <div
                                            className="h-3 rounded-full bg-secondary"
                                            style={{ width: `${Math.max((item.pizzas / maxPizzas) * 100, 6)}%` }}
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-muted">{formatPizzaQuantity(item.pizzas)}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted">No hay produccion registrada en este rango.</p>
                        )}
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
                                            <td className="px-4 py-3 text-muted">{formatPizzaQuantity(day.total_pizzas)}</td>
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
                        <h3 className="text-2xl font-semibold text-text">Metodos de pago</h3>
                        <div className="mt-5 space-y-3">
                            {paymentBreakdown.length > 0 ? (
                                paymentBreakdown.map((item) => (
                                    <div key={item.method} className="flex items-center justify-between rounded-2xl bg-background/70 p-4">
                                        <div>
                                            <p className="font-semibold capitalize text-text">{item.method.replace('_', ' ')}</p>
                                            <p className="text-sm text-muted">{item.count} pedidos</p>
                                        </div>
                                        <p className="font-semibold text-text">{formatCurrency(item.total)}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted">No hay pagos registrados para este filtro.</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <h3 className="text-2xl font-semibold text-text">Estado de pedidos</h3>
                        <div className="mt-5 space-y-3">
                            {statusBreakdown.map((item) => (
                                <div key={item.status} className="flex items-center justify-between rounded-2xl bg-background/70 p-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(item.status)}`}>
                                        {item.label}
                                    </span>
                                    <p className="text-lg font-semibold text-text">{item.count}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-primary/10 bg-white/85 p-6 shadow-modern">
                        <h3 className="text-2xl font-semibold text-text">Alertas de stock</h3>
                        <div className="mt-5 space-y-3">
                            {stockAlerts.length > 0 ? (
                                stockAlerts.map((pizza) => (
                                    <div key={pizza.id} className="flex items-center justify-between rounded-2xl bg-background/70 p-4">
                                        <div>
                                            <p className="font-semibold text-text">{pizza.name}</p>
                                            <p className="text-sm text-muted">Umbral minimo: {formatStockValue(pizza.low_stock_threshold)} pizzas</p>
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
                                            <p className="font-semibold text-text">{formatPizzaQuantity(product.quantity)}</p>
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
                                                <p className="mt-1 text-xs uppercase tracking-wide text-muted">
                                                    Aviso: {getOrderAlertLabel(order)}
                                                </p>
                                                {order.notify_whatsapp ? (
                                                    <div className="mt-1 space-y-1">
                                                        <p className="text-xs uppercase tracking-wide text-muted">
                                                            WhatsApp: {order.whatsapp_notification_status}
                                                        </p>
                                                        {order.whatsapp_last_notification_at ? (
                                                            <p className="text-xs text-muted">
                                                                Ultimo intento: {new Date(order.whatsapp_last_notification_at).toLocaleString('es-AR')}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(order.status)}`}>
                                                    {ORDER_STATUS_OPTIONS.find((option) => option.value === order.status)?.label ?? order.status}
                                                </span>
                                                <p className="mt-2 text-sm font-semibold text-text">{formatCurrency(order.total)}</p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted">
                                                    {order.sales.map((item) => formatSaleItemLabel(item)).join(' + ')} - {order.include_shipping ? 'con envio' : 'sin envio'}
                                                </p>
                                                {order.notify_whatsapp && order.whatsapp_last_message ? (
                                                    <p className="text-xs text-muted">
                                                        Mensaje: {order.whatsapp_last_message}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="flex flex-col gap-2 sm:items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => printKitchenTicket(order)}
                                                    className="rounded-2xl border border-primary/15 bg-white px-4 py-2 text-sm font-semibold text-secondary hover:border-primary hover:text-primary"
                                                >
                                                    Imprimir comanda
                                                </button>
                                                {order.status !== 'listo_para_retirar' && order.status !== 'entregado' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleMarkReady(order)}
                                                        className="rounded-2xl border border-success/30 bg-white px-4 py-2 text-sm font-semibold text-success hover:border-success hover:bg-success/5"
                                                    >
                                                        Marcar listo
                                                    </button>
                                                ) : null}
                                                {order.receiver_phone ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => actions.openOrderWhatsApp(order.date, order.order_id)}
                                                        className="rounded-2xl border border-success/30 bg-white px-4 py-2 text-sm font-semibold text-success hover:border-success hover:bg-success/5"
                                                    >
                                                        Abrir WhatsApp
                                                    </button>
                                                ) : null}
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
