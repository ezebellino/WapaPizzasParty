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

    return {
        totalRevenue,
        totalPizzas,
        totalOrders,
        averageTicket: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        orders,
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
