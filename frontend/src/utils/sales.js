export const HALF_PIZZA_STEP = 0.5;

export const ORDER_STATUS_OPTIONS = [
    { value: 'en_preparacion', label: 'En preparacion' },
    { value: 'entregado', label: 'Entregado' },
    { value: 'cancelado', label: 'Cancelado' },
];

export const formatCurrency = (value) =>
    new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0,
    }).format(value || 0);

const normalizeHalfStep = (value) => Math.round((Number(value) || 0) * 2) / 2;

export const formatStockValue = (value) => {
    const normalized = normalizeHalfStep(value);
    return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(1).replace('.', ',');
};

export const formatPizzaQuantity = (value) => {
    const normalized = normalizeHalfStep(value);
    const halves = Math.round(normalized * 2);
    const fullPizzas = Math.floor(halves / 2);
    const hasHalf = halves % 2 === 1;

    if (fullPizzas === 0 && hasHalf) {
        return '1/2 pizza';
    }

    if (hasHalf) {
        return `${fullPizzas} 1/2 pizzas`;
    }

    return `${fullPizzas} ${fullPizzas === 1 ? 'pizza' : 'pizzas'}`;
};

export const formatSaleItemLabel = (item) => `${formatPizzaQuantity(item.quantity)} de ${item.name}`;

export const getOrderAlertLabel = (order) => {
    if (order.use_vipper && order.vipper_code) {
        return `Vipper ${order.vipper_code}`;
    }

    if (order.notify_whatsapp && order.receiver_phone) {
        return `WhatsApp ${order.receiver_phone}`;
    }

    return 'Sin aviso';
};

export const calculateCartSubtotal = (cart) =>
    Math.round(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));

export const calculateCartPizzas = (cart) =>
    normalizeHalfStep(cart.reduce((sum, item) => sum + item.quantity, 0));

export const calculateCartTotal = (cart, includeShipping, shippingCost) =>
    calculateCartSubtotal(cart) + (includeShipping ? shippingCost : 0);

export const flattenOrders = (salesDays) =>
    salesDays.flatMap((day) =>
        day.orders.map((order) => ({
            ...order,
            date: day.date,
        }))
    );

export const buildTreasuryStats = (salesDays) => {
    const orders = flattenOrders(salesDays);
    const totalRevenue = salesDays.reduce((sum, day) => sum + day.total_revenue, 0);
    const totalPizzas = normalizeHalfStep(salesDays.reduce((sum, day) => sum + day.total_pizzas, 0));
    const totalOrders = salesDays.reduce((sum, day) => sum + day.order_count, 0);
    const bestDay = [...salesDays].sort((a, b) => b.total_revenue - a.total_revenue)[0] ?? null;

    return {
        totalRevenue,
        totalPizzas,
        totalOrders,
        averageTicket: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        orders,
        bestDay,
    };
};

export const buildTopProducts = (salesDays) => {
    const ranking = new Map();

    salesDays.forEach((day) => {
        day.orders.forEach((order) => {
            order.sales.forEach((item) => {
                const current = ranking.get(item.id) ?? {
                    id: item.id,
                    name: item.name,
                    quantity: 0,
                    revenue: 0,
                };

                current.quantity = normalizeHalfStep(current.quantity + item.quantity);
                current.revenue += Math.round(item.price * item.quantity);
                ranking.set(item.id, current);
            });
        });
    });

    return [...ranking.values()].sort((a, b) => b.quantity - a.quantity);
};

export const buildDailyPerformance = (salesDays) =>
    [...salesDays]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((day) => ({
            date: day.date,
            revenue: day.total_revenue,
            pizzas: day.total_pizzas,
            orders: day.order_count,
        }));

const getWeekStart = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - dayOfWeek);
    return date.toISOString().slice(0, 10);
};

export const buildWeeklyPerformance = (salesDays) => {
    const weeklyMap = new Map();

    buildDailyPerformance(salesDays).forEach((day) => {
        const weekStart = getWeekStart(day.date);
        const current = weeklyMap.get(weekStart) ?? {
            period: weekStart,
            revenue: 0,
            pizzas: 0,
            orders: 0,
        };

        current.revenue += day.revenue;
        current.pizzas = normalizeHalfStep(current.pizzas + day.pizzas);
        current.orders += day.orders;
        weeklyMap.set(weekStart, current);
    });

    return [...weeklyMap.values()].sort((a, b) => a.period.localeCompare(b.period));
};

export const buildMonthlyPerformance = (salesDays) => {
    const monthlyMap = new Map();

    buildDailyPerformance(salesDays).forEach((day) => {
        const month = day.date.slice(0, 7);
        const current = monthlyMap.get(month) ?? {
            period: month,
            revenue: 0,
            pizzas: 0,
            orders: 0,
        };

        current.revenue += day.revenue;
        current.pizzas = normalizeHalfStep(current.pizzas + day.pizzas);
        current.orders += day.orders;
        monthlyMap.set(month, current);
    });

    return [...monthlyMap.values()].sort((a, b) => a.period.localeCompare(b.period));
};

export const buildOpenOrders = (salesDays) =>
    flattenOrders(salesDays)
        .filter((order) => order.status === 'en_preparacion')
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

export const buildPaymentBreakdown = (salesDays) => {
    const breakdown = new Map();

    flattenOrders(salesDays).forEach((order) => {
        const current = breakdown.get(order.payment_method) ?? {
            method: order.payment_method,
            total: 0,
            count: 0,
        };

        current.total += order.total;
        current.count += 1;
        breakdown.set(order.payment_method, current);
    });

    return [...breakdown.values()].sort((a, b) => b.total - a.total);
};

export const buildStatusBreakdown = (salesDays) => {
    const breakdown = new Map(
        ORDER_STATUS_OPTIONS.map((option) => [
            option.value,
            { status: option.value, label: option.label, count: 0 },
        ])
    );

    flattenOrders(salesDays).forEach((order) => {
        const current = breakdown.get(order.status) ?? {
            status: order.status,
            label: order.status,
            count: 0,
        };

        current.count += 1;
        breakdown.set(order.status, current);
    });

    return [...breakdown.values()].sort((a, b) => b.count - a.count);
};

export const getStatusBadgeClass = (status) => {
    switch (status) {
        case 'en_preparacion':
            return 'bg-primary/15 text-primary';
        case 'entregado':
            return 'bg-emerald-100 text-emerald-700';
        case 'cancelado':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-background text-muted';
    }
};

export const getStockBadgeClass = (pizza) => {
    if (!pizza.available || pizza.stock === 0) {
        return 'bg-red-100 text-red-700';
    }

    if (pizza.stock <= pizza.low_stock_threshold) {
        return 'bg-accent/15 text-secondary';
    }

    return 'bg-success/15 text-success';
};

export const getStockLabel = (pizza) => {
    if (!pizza.available || pizza.stock === 0) {
        return 'Sin stock';
    }

    if (pizza.stock <= pizza.low_stock_threshold) {
        return `Stock bajo: ${formatStockValue(pizza.stock)}`;
    }

    return `Stock: ${formatStockValue(pizza.stock)}`;
};

export const buildStockAlerts = (pizzas) =>
    pizzas
        .filter((pizza) => !pizza.available || pizza.stock <= pizza.low_stock_threshold)
        .sort((a, b) => a.stock - b.stock);

const escapeCsvValue = (value) => {
    const normalized = String(value ?? '').replace(/"/g, '""');
    return `"${normalized}"`;
};

export const downloadTreasuryCsv = (salesDays, selectedDate) => {
    const orders = flattenOrders(salesDays);
    const headers = [
        'fecha',
        'pedido_id',
        'receptor',
        'telefono',
        'medio_pago',
        'estado',
        'aviso_cliente',
        'incluye_envio',
        'costo_envio',
        'subtotal',
        'total',
        'aviso_whatsapp',
        'detalle_pizzas',
        'observaciones',
    ];

    const rows = orders.map((order) => [
        order.date,
        order.order_id,
        order.receiver_name,
        order.receiver_phone,
        order.payment_method,
        order.status,
        getOrderAlertLabel(order),
        order.include_shipping ? 'si' : 'no',
        order.shipping_cost,
        order.subtotal,
        order.total,
        order.notify_whatsapp ? order.whatsapp_notification_status : 'no',
        order.sales.map((item) => formatSaleItemLabel(item)).join(' | '),
        order.notes,
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsvValue).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const suffix = selectedDate || 'todas-las-fechas';

    link.href = url;
    link.setAttribute('download', `tesoreria-${suffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const escapeHtml = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const buildPerformanceRowsHtml = (items, type) => {
    if (items.length === 0) {
        return `
            <tr>
                <td colspan="4" style="padding: 12px 14px; text-align:center; color:#8c6676;">Sin datos para este periodo.</td>
            </tr>
        `;
    }

    return items
        .map(
            (item) => `
                <tr>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(item[type])}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${item.orders}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(formatPizzaQuantity(item.pizzas))}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(formatCurrency(item.revenue))}</td>
                </tr>
            `
        )
        .join('');
};

const buildOrderRowsHtml = (orders) => {
    if (orders.length === 0) {
        return `
            <tr>
                <td colspan="7" style="padding: 12px 14px; text-align:center; color:#8c6676;">No hay pedidos en el rango seleccionado.</td>
            </tr>
        `;
    }

    return orders
        .map(
            (order) => `
                <tr>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.date)}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.order_id)}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.receiver_name)}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.sales.map((item) => formatSaleItemLabel(item)).join(' + '))}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.payment_method.replaceAll('_', ' '))}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(order.status.replaceAll('_', ' '))}</td>
                    <td style="padding: 12px 14px; border-bottom:1px solid #f3bfd8;">${escapeHtml(formatCurrency(order.total))}</td>
                </tr>
            `
        )
        .join('');
};

const buildSimpleListHtml = (items, formatter, emptyLabel) => {
    if (items.length === 0) {
        return `<p style="margin:0; color:#8c6676;">${escapeHtml(emptyLabel)}</p>`;
    }

    return `
        <div style="display:grid; gap:10px;">
            ${items.map((item) => formatter(item)).join('')}
        </div>
    `;
};

export const openTreasuryPdfReport = (salesDays, filters = {}) => {
    if (typeof window === 'undefined') {
        return;
    }

    const openedWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!openedWindow) {
        return;
    }

    const stats = buildTreasuryStats(salesDays);
    const dailyPerformance = buildDailyPerformance(salesDays);
    const weeklyPerformance = buildWeeklyPerformance(salesDays);
    const monthlyPerformance = buildMonthlyPerformance(salesDays);
    const topProducts = buildTopProducts(salesDays).slice(0, 10);
    const paymentBreakdown = buildPaymentBreakdown(salesDays);
    const statusBreakdown = buildStatusBreakdown(salesDays);
    const orders = [...stats.orders].sort((a, b) => {
        const dateDiff = new Date(b.created_at) - new Date(a.created_at);
        if (!Number.isNaN(dateDiff) && dateDiff !== 0) {
            return dateDiff;
        }

        return String(b.date).localeCompare(String(a.date));
    });

    const generatedAt = new Date().toLocaleString('es-AR');
    const filterLabel =
        filters.startDate || filters.endDate
            ? `${filters.startDate || 'inicio'} a ${filters.endDate || 'hoy'}`
            : 'Todo el historial';

    const reportHtml = `
        <html>
            <head>
                <title>Reporte de tesoreria - WapaPizzaParty</title>
                <meta charset="UTF-8" />
                <style>
                    @page { size: A4 portrait; margin: 16mm; }
                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        color: #3e2330;
                        background: #fffdfd;
                        margin: 0;
                    }
                    .sheet {
                        display: grid;
                        gap: 18px;
                    }
                    .hero {
                        border: 2px solid #ffd2e5;
                        border-radius: 24px;
                        overflow: hidden;
                    }
                    .hero-top {
                        background: linear-gradient(135deg, #eb0a7c, #b10861);
                        color: white;
                        padding: 22px;
                    }
                    .hero-top h1 {
                        margin: 8px 0 6px;
                        font-size: 34px;
                    }
                    .hero-top p {
                        margin: 0;
                        opacity: 0.92;
                    }
                    .hero-meta {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 14px;
                        padding: 18px 22px;
                        background: #fff5f9;
                    }
                    .metrics {
                        display: grid;
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                        gap: 12px;
                    }
                    .metric {
                        border: 1px solid #ffd2e5;
                        border-radius: 18px;
                        padding: 16px;
                        background: white;
                    }
                    .metric-label {
                        margin: 0;
                        font-size: 12px;
                        text-transform: uppercase;
                        letter-spacing: 0.12em;
                        color: #8c6676;
                    }
                    .metric-value {
                        margin: 10px 0 0;
                        font-size: 26px;
                        font-weight: 700;
                        color: #3e2330;
                    }
                    .section {
                        border: 1px solid #ffd2e5;
                        border-radius: 22px;
                        padding: 18px;
                        break-inside: avoid;
                    }
                    .section h2 {
                        margin: 0 0 4px;
                        font-size: 22px;
                    }
                    .section p.section-subtitle {
                        margin: 0 0 14px;
                        color: #8c6676;
                        font-size: 13px;
                    }
                    .grid-2 {
                        display: grid;
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 16px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    th {
                        text-align: left;
                        padding: 10px 14px;
                        background: #fff5f9;
                        color: #8c6676;
                        text-transform: uppercase;
                        letter-spacing: 0.08em;
                        font-size: 11px;
                    }
                    .pill {
                        display: inline-block;
                        padding: 5px 10px;
                        border-radius: 999px;
                        background: #fff0f7;
                        color: #b10861;
                        font-size: 11px;
                        font-weight: 700;
                    }
                    .list-card {
                        border: 1px solid #f3bfd8;
                        border-radius: 16px;
                        padding: 12px 14px;
                        background: #fffdfd;
                    }
                    .list-card strong {
                        display: block;
                        margin-bottom: 4px;
                    }
                    .footer-note {
                        text-align: center;
                        color: #8c6676;
                        font-size: 12px;
                    }
                    @media print {
                        .print-actions { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="sheet">
                    <div class="print-actions" style="display:flex; justify-content:flex-end; padding: 12px 0 0;">
                        <button onclick="window.print()" style="border:none; border-radius:999px; background:#eb0a7c; color:white; font-weight:700; padding:12px 18px; cursor:pointer;">
                            Guardar / imprimir PDF
                        </button>
                    </div>

                    <section class="hero">
                        <div class="hero-top">
                            <p style="font-size:12px; letter-spacing:0.26em; text-transform:uppercase;">Reporte comercial</p>
                            <h1>WapaPizzaParty</h1>
                            <p>Resumen de ventas, produccion y comportamiento del negocio.</p>
                        </div>
                        <div class="hero-meta">
                            <div>
                                <p class="metric-label">Rango analizado</p>
                                <p style="margin:8px 0 0; font-size:20px; font-weight:700;">${escapeHtml(filterLabel)}</p>
                            </div>
                            <div>
                                <p class="metric-label">Generado</p>
                                <p style="margin:8px 0 0; font-size:20px; font-weight:700;">${escapeHtml(generatedAt)}</p>
                            </div>
                        </div>
                    </section>

                    <section class="metrics">
                        <div class="metric">
                            <p class="metric-label">Ventas registradas</p>
                            <p class="metric-value">${stats.totalOrders}</p>
                        </div>
                        <div class="metric">
                            <p class="metric-label">Pizzas vendidas</p>
                            <p class="metric-value">${escapeHtml(formatPizzaQuantity(stats.totalPizzas))}</p>
                        </div>
                        <div class="metric">
                            <p class="metric-label">Facturacion</p>
                            <p class="metric-value">${escapeHtml(formatCurrency(stats.totalRevenue))}</p>
                        </div>
                        <div class="metric">
                            <p class="metric-label">Ticket promedio</p>
                            <p class="metric-value">${escapeHtml(formatCurrency(stats.averageTicket))}</p>
                        </div>
                    </section>

                    <section class="grid-2">
                        <div class="section">
                            <h2>Resumen por estado</h2>
                            <p class="section-subtitle">Cierre operativo del rango elegido.</p>
                            ${buildSimpleListHtml(
                                statusBreakdown,
                                (item) => `
                                    <div class="list-card">
                                        <span class="pill">${escapeHtml(item.label)}</span>
                                        <strong style="margin-top:10px;">${item.count} pedidos</strong>
                                    </div>
                                `,
                                'Sin movimientos en este rango.'
                            )}
                        </div>
                        <div class="section">
                            <h2>Medios de pago</h2>
                            <p class="section-subtitle">Distribucion del ingreso por metodo.</p>
                            ${buildSimpleListHtml(
                                paymentBreakdown,
                                (item) => `
                                    <div class="list-card">
                                        <strong>${escapeHtml(item.method.replaceAll('_', ' '))}</strong>
                                        <div style="display:flex; justify-content:space-between; gap:12px; color:#8c6676;">
                                            <span>${item.count} pedidos</span>
                                            <span>${escapeHtml(formatCurrency(item.total))}</span>
                                        </div>
                                    </div>
                                `,
                                'Sin pagos registrados en este rango.'
                            )}
                        </div>
                    </section>

                    <section class="section">
                        <h2>Productos mas vendidos</h2>
                        <p class="section-subtitle">Ranking comercial para detectar favoritos y volumen.</p>
                        ${buildSimpleListHtml(
                            topProducts,
                            (item, index) => `
                                <div class="list-card">
                                    <strong>${escapeHtml(item.name)}</strong>
                                    <div style="display:flex; justify-content:space-between; gap:12px; color:#8c6676;">
                                        <span>${escapeHtml(formatPizzaQuantity(item.quantity))}</span>
                                        <span>${escapeHtml(formatCurrency(item.revenue))}</span>
                                    </div>
                                </div>
                            `,
                            'Todavia no hay datos para ranking.'
                        )}
                    </section>

                    <section class="section">
                        <h2>Resumen por dia</h2>
                        <p class="section-subtitle">Vista diaria de pedidos, produccion y facturacion.</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Pedidos</th>
                                    <th>Pizzas</th>
                                    <th>Facturacion</th>
                                </tr>
                            </thead>
                            <tbody>${buildPerformanceRowsHtml(dailyPerformance, 'date')}</tbody>
                        </table>
                    </section>

                    <section class="grid-2">
                        <div class="section">
                            <h2>Resumen semanal</h2>
                            <p class="section-subtitle">Consolidado por semana para detectar ritmo del negocio.</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Semana</th>
                                        <th>Pedidos</th>
                                        <th>Pizzas</th>
                                        <th>Facturacion</th>
                                    </tr>
                                </thead>
                                <tbody>${buildPerformanceRowsHtml(weeklyPerformance, 'period')}</tbody>
                            </table>
                        </div>
                        <div class="section">
                            <h2>Resumen mensual</h2>
                            <p class="section-subtitle">Lectura macro del rendimiento comercial.</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mes</th>
                                        <th>Pedidos</th>
                                        <th>Pizzas</th>
                                        <th>Facturacion</th>
                                    </tr>
                                </thead>
                                <tbody>${buildPerformanceRowsHtml(monthlyPerformance, 'period')}</tbody>
                            </table>
                        </div>
                    </section>

                    <section class="section">
                        <h2>Detalle de pedidos</h2>
                        <p class="section-subtitle">Comprobante comercial del periodo seleccionado.</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Pedido</th>
                                    <th>Cliente</th>
                                    <th>Detalle</th>
                                    <th>Pago</th>
                                    <th>Estado</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>${buildOrderRowsHtml(orders)}</tbody>
                        </table>
                    </section>

                    <p class="footer-note">Reporte generado por WapaPizzaParty.</p>
                </div>
            </body>
        </html>
    `;

    openedWindow.document.write(reportHtml);
    openedWindow.document.close();
    openedWindow.focus();
};

export const printKitchenTicket = (order) => {
    if (typeof window === 'undefined') {
        return;
    }

    const openedWindow = window.open('', '_blank', 'width=480,height=720');
    if (!openedWindow) {
        return;
    }

    const createdAt = order.created_at
        ? new Date(order.created_at).toLocaleString('es-AR')
        : new Date().toLocaleString('es-AR');

    const alertLabel = getOrderAlertLabel(order);
    const deliveryLabel = order.include_shipping ? `Envio - ${formatCurrency(order.shipping_cost)}` : 'Retira en mostrador';
    const ticketItems = order.sales
        .map(
            (item) => `
                <li style="padding: 12px 0; border-bottom: 1px dashed #f3bfd8;">
                    <div style="display:flex; justify-content:space-between; gap:16px;">
                        <strong style="font-size:16px; color:#3e2330;">${formatSaleItemLabel(item)}</strong>
                        <span style="font-size:14px; color:#eb0a7c; font-weight:700;">${formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <div style="margin-top:4px; font-size:13px; color:#8c6676;">${item.description || 'Sin detalle adicional.'}</div>
                </li>
            `
        )
        .join('');
    const notes = order.notes || 'Sin observaciones.';

    openedWindow.document.write(`
        <html>
            <head>
                <title>Comanda ${order.order_id}</title>
                <meta charset="UTF-8" />
            </head>
            <body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 18px; color: #3e2330; background: #fffdfd;">
                <div style="max-width: 360px; margin: 0 auto; border: 2px solid #ffd2e5; border-radius: 18px; overflow: hidden;">
                    <div style="padding: 18px; background: linear-gradient(135deg, #eb0a7c, #b10861); color: white;">
                        <p style="margin:0; font-size:11px; letter-spacing:0.28em; text-transform:uppercase; opacity:0.82;">Cocina</p>
                        <h1 style="margin:8px 0 4px; font-size:28px; line-height:1;">WapaPizzaParty</h1>
                        <p style="margin:0; font-size:14px; opacity:0.9;">Comanda de preparación</p>
                    </div>
                    <div style="padding: 18px;">
                        <div style="display:grid; gap:8px; padding-bottom:16px; border-bottom: 1px dashed #f3bfd8;">
                            <p style="margin:0;"><strong>Pedido:</strong> ${order.order_id}</p>
                            <p style="margin:0;"><strong>Hora:</strong> ${createdAt}</p>
                            <p style="margin:0;"><strong>Cliente:</strong> ${order.receiver_name}</p>
                            <p style="margin:0;"><strong>Aviso:</strong> ${alertLabel}</p>
                            <p style="margin:0;"><strong>Entrega:</strong> ${deliveryLabel}</p>
                        </div>
                        <h2 style="margin:18px 0 10px; font-size:18px;">Preparar ahora</h2>
                        <ul style="list-style:none; padding:0; margin:0;">${ticketItems}</ul>
                        <div style="margin-top:16px; padding:14px; border-radius:14px; background:#fff5f9; border:1px solid #ffd2e5;">
                            <p style="margin:0 0 6px; font-size:12px; letter-spacing:0.12em; text-transform:uppercase; color:#b10861;"><strong>Observaciones</strong></p>
                            <p style="margin:0; font-size:14px;">${notes}</p>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:18px; padding-top:14px; border-top: 1px dashed #f3bfd8;">
                            <span style="font-size:14px; color:#8c6676;">Total cliente</span>
                            <strong style="font-size:22px; color:#eb0a7c;">${formatCurrency(order.total)}</strong>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    `);
    openedWindow.document.close();
    openedWindow.focus();
    openedWindow.print();
};
