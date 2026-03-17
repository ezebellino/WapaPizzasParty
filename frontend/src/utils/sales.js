export const ORDER_STATUS_OPTIONS = [
    { value: 'pendiente', label: 'Pendiente' },
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

export const calculateCartSubtotal = (cart) =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

export const calculateCartPizzas = (cart) =>
    cart.reduce((sum, item) => sum + item.quantity, 0);

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
    const totalPizzas = salesDays.reduce((sum, day) => sum + day.total_pizzas, 0);
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

                current.quantity += item.quantity;
                current.revenue += item.price * item.quantity;
                ranking.set(item.id, current);
            });
        });
    });

    return [...ranking.values()].sort((a, b) => b.quantity - a.quantity);
};

export const buildOpenOrders = (salesDays) =>
    flattenOrders(salesDays)
        .filter((order) => order.status === 'pendiente' || order.status === 'en_preparacion')
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
        case 'pendiente':
            return 'bg-accent/15 text-secondary';
        case 'en_preparacion':
            return 'bg-primary/15 text-primary';
        case 'entregado':
            return 'bg-success/15 text-success';
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
        return `Stock bajo: ${pizza.stock}`;
    }

    return `Stock: ${pizza.stock}`;
};

export const buildStockAlerts = (pizzas) =>
    pizzas
        .filter((pizza) => !pizza.available || pizza.stock <= pizza.low_stock_threshold)
        .sort((a, b) => a.stock - b.stock);
