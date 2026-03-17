export const HALF_PIZZA_STEP = 0.5;

export const ORDER_STATUS_OPTIONS = [
    { value: 'procesado', label: 'Procesado' },
    { value: 'en_preparacion', label: 'En preparacion' },
    { value: 'listo_para_retirar', label: 'Listo para retirar' },
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

export const buildOpenOrders = (salesDays) =>
    flattenOrders(salesDays)
        .filter((order) =>
            order.status === 'procesado'
            || order.status === 'en_preparacion'
            || order.status === 'listo_para_retirar'
        )
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
        case 'procesado':
            return 'bg-accent/15 text-secondary';
        case 'en_preparacion':
            return 'bg-primary/15 text-primary';
        case 'listo_para_retirar':
            return 'bg-success/15 text-success';
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

    const lines = order.sales
        .map(
            (item) => `
                <li style="margin-bottom:10px;">
                    <strong>${formatSaleItemLabel(item)}</strong><br />
                    <span>${item.description || ''}</span>
                </li>
            `
        )
        .join('');

    const alertLabel = getOrderAlertLabel(order);
    const deliveryLabel = order.include_shipping ? `Envio - ${formatCurrency(order.shipping_cost)}` : 'Retira en mostrador';

    openedWindow.document.write(`
        <html>
            <head>
                <title>Comanda ${order.order_id}</title>
            </head>
            <body style="font-family: Arial, sans-serif; padding: 24px; color: #111;">
                <h1 style="margin:0 0 8px;">WapaPizzaParty</h1>
                <p style="margin:0 0 16px;">Comanda de cocina</p>
                <p style="margin:0 0 6px;"><strong>Pedido:</strong> ${order.order_id}</p>
                <p style="margin:0 0 6px;"><strong>Hora:</strong> ${createdAt}</p>
                <p style="margin:0 0 6px;"><strong>Cliente:</strong> ${order.receiver_name}</p>
                <p style="margin:0 0 6px;"><strong>Aviso:</strong> ${alertLabel}</p>
                <p style="margin:0 0 16px;"><strong>Entrega:</strong> ${deliveryLabel}</p>
                <hr />
                <h2 style="margin:16px 0 12px;">Preparar</h2>
                <ul style="padding-left:20px;">${lines}</ul>
                <hr />
                <p style="margin:16px 0 6px;"><strong>Observaciones:</strong></p>
                <p style="margin:0 0 16px;">${order.notes || 'Sin observaciones.'}</p>
                <p style="margin:0;"><strong>Total:</strong> ${formatCurrency(order.total)}</p>
            </body>
        </html>
    `);
    openedWindow.document.close();
    openedWindow.focus();
    openedWindow.print();
};
