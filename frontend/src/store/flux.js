import { meRequest, loginRequest } from '../api/auth';
import { fetchPizzas, updatePizzaInventory } from '../api/pizzas';
import { createSale, fetchOrderWhatsAppLink, fetchSales, updateOrderStatus } from '../api/sales';
import { HALF_PIZZA_STEP } from '../utils/sales';

const emptySession = {
    isAuthenticated: false,
    role: null,
    name: '',
    username: '',
    accessToken: '',
};

const resetOrderForm = () => ({
    receiverName: '',
    receiverPhone: '',
    paymentMethod: 'efectivo',
    notes: '',
    includeShipping: false,
    shippingCost: 1500,
    alertChannel: 'none',
    notifyWhatsApp: false,
    vipperCode: '',
});

const normalizeHalfStep = (value) => Math.round((Number(value) || 0) * 2) / 2;
const normalizeCartIncrement = (value) => {
    const normalized = normalizeHalfStep(value);
    return normalized >= HALF_PIZZA_STEP ? normalized : HALF_PIZZA_STEP;
};

const syncCartWithPizzas = (cart, pizzas) =>
    cart
        .map((item) => {
            const pizza = pizzas.find((candidate) => candidate.id === item.id);
            if (!pizza || !pizza.available || pizza.stock === 0) {
                return null;
            }

            return {
                ...item,
                quantity: normalizeHalfStep(Math.min(item.quantity, pizza.stock)),
            };
        })
        .filter((item) => item && item.quantity >= HALF_PIZZA_STEP);

const persistSession = (storageKey, session) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(session));
};

const clearSessionStorage = (storageKey) => {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(storageKey);
};

const getFlux = (setStore, getStore, storageKey) => ({
    login: async ({ username, password }) => {
        try {
            const response = await loginRequest({ username, password });
            const session = {
                isAuthenticated: true,
                role: response.user.role,
                name: response.user.name,
                username: response.user.username,
                accessToken: response.access_token,
            };

            persistSession(storageKey, session);
            setStore((prevStore) => ({
                ...prevStore,
                appError: null,
                session,
            }));
            return true;
        } catch (error) {
            setStore((prevStore) => ({
                ...prevStore,
                appError: 'Credenciales invalidas.',
            }));
            return false;
        }
    },

    hydrateSession: async () => {
        try {
            const user = await meRequest();
            setStore((prevStore) => ({
                ...prevStore,
                appError: null,
                session: {
                    ...prevStore.session,
                    isAuthenticated: true,
                    role: user.role,
                    name: user.name,
                    username: user.username,
                },
            }));
        } catch {
            clearSessionStorage(storageKey);
            setStore((prevStore) => ({
                ...prevStore,
                session: emptySession,
            }));
        }
    },

    logout: () => {
        clearSessionStorage(storageKey);
        setStore((prevStore) => ({
            ...prevStore,
            session: emptySession,
            appError: null,
        }));
    },

    loadSales: async () => {
        setStore((prevStore) => ({
            ...prevStore,
            salesLoading: true,
            appError: null,
        }));

        try {
            const data = await fetchSales();
            setStore((prevStore) => ({
                ...prevStore,
                sales: data,
                salesLoading: false,
            }));
        } catch (error) {
            console.error('Error al cargar ventas:', error);
            setStore((prevStore) => ({
                ...prevStore,
                salesLoading: false,
                appError: 'No pudimos cargar la tesoreria.',
            }));
        }
    },

    loadPizzas: async () => {
        setStore((prevStore) => ({
            ...prevStore,
            pizzasLoading: true,
            appError: null,
        }));

        try {
            const data = await fetchPizzas();
            setStore((prevStore) => ({
                ...prevStore,
                pizzas: data,
                pizzasLoading: false,
                cart: syncCartWithPizzas(prevStore.cart, data),
            }));
        } catch (error) {
            console.error('Error al cargar pizzas:', error);
            setStore((prevStore) => ({
                ...prevStore,
                pizzasLoading: false,
                appError: 'No pudimos cargar el catalogo de pizzas.',
            }));
        }
    },

    setOrderField: (field, value) => {
        setStore((prevStore) => ({
            ...prevStore,
            orderForm: {
                ...prevStore.orderForm,
                ...(field === 'alertChannel'
                    ? {
                        alertChannel: value,
                        notifyWhatsApp: value === 'whatsapp',
                        ...(value !== 'vipper' ? { vipperCode: '' } : {}),
                      }
                    : { [field]: value }),
            },
        }));
    },

    toggleShipping: () => {
        setStore((prevStore) => ({
            ...prevStore,
            orderForm: {
                ...prevStore.orderForm,
                includeShipping: !prevStore.orderForm.includeShipping,
            },
        }));
    },

    addToCart: (pizza, quantity = HALF_PIZZA_STEP) => {
        if (!pizza.available || pizza.stock === 0) {
            setStore((prevStore) => ({
                ...prevStore,
                appError: `${pizza.name} no tiene stock disponible.`,
            }));
            return;
        }

        const quantityToAdd = normalizeCartIncrement(quantity);

        setStore((prevStore) => {
            const existingItem = prevStore.cart.find((item) => item.id === pizza.id);
            const reservedQuantity = normalizeHalfStep(existingItem?.quantity ?? 0);

            if (reservedQuantity + quantityToAdd > pizza.stock + 1e-9) {
                return {
                    ...prevStore,
                    appError: `No puedes agregar mas de ${pizza.stock} pizzas de ${pizza.name}.`,
                };
            }

            if (existingItem) {
                return {
                    ...prevStore,
                    appError: null,
                    cart: prevStore.cart.map((item) =>
                        item.id === pizza.id ? { ...item, quantity: normalizeHalfStep(item.quantity + quantityToAdd) } : item
                    ),
                };
            }

            return {
                ...prevStore,
                appError: null,
                cart: [...prevStore.cart, { ...pizza, quantity: quantityToAdd }],
            };
        });
    },

    incrementCartItem: (id) => {
        setStore((prevStore) => {
            const pizza = prevStore.pizzas.find((item) => item.id === id);
            const cartItem = prevStore.cart.find((item) => item.id === id);

            if (!pizza || !cartItem || cartItem.quantity + HALF_PIZZA_STEP > pizza.stock + 1e-9) {
                return {
                    ...prevStore,
                    appError: pizza ? `No hay mas stock para ${pizza.name}.` : prevStore.appError,
                };
            }

            return {
                ...prevStore,
                appError: null,
                cart: prevStore.cart.map((item) =>
                    item.id === id ? { ...item, quantity: normalizeHalfStep(item.quantity + HALF_PIZZA_STEP) } : item
                ),
            };
        });
    },

    decrementCartItem: (id) => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: prevStore.cart
                .map((item) =>
                    item.id === id ? { ...item, quantity: normalizeHalfStep(item.quantity - HALF_PIZZA_STEP) } : item
                )
                .filter((item) => item.quantity >= HALF_PIZZA_STEP),
        }));
    },

    removeFromCart: (id) => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: prevStore.cart.filter((item) => item.id !== id),
        }));
    },

    clearOrderDraft: () => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: [],
            lastCreatedOrder: null,
            appError: null,
            orderForm: resetOrderForm(),
        }));
    },

    updatePizzaInventory: async (pizzaId, payload) => {
        if (typeof payload !== 'object') {
            return;
        }

        try {
            const updatedPizza = await updatePizzaInventory(pizzaId, payload);
            setStore((prevStore) => {
                const updatedPizzas = prevStore.pizzas.map((pizza) =>
                    pizza.id === pizzaId ? updatedPizza : pizza
                );

                return {
                    ...prevStore,
                    appError: null,
                    pizzas: updatedPizzas,
                    cart: syncCartWithPizzas(prevStore.cart, updatedPizzas),
                };
            });
        } catch (error) {
            console.error('Error al actualizar inventario:', error);
            setStore((prevStore) => ({
                ...prevStore,
                appError: 'No pudimos actualizar el inventario de la pizza.',
            }));
        }
    },

    updateOrderStatus: async (date, orderId, status) => {
        try {
            const response = await updateOrderStatus(date, orderId, status);
            setStore((prevStore) => ({
                ...prevStore,
                appError: null,
                sales: prevStore.sales.map((day) => ({
                    ...day,
                    orders: day.date === date
                        ? day.orders.map((order) => (order.order_id === orderId ? response.order : order))
                        : day.orders,
                })),
            }));
            return { success: true };
        } catch (error) {
            console.error('Error al actualizar estado del pedido:', error);
            setStore((prevStore) => ({
                ...prevStore,
                appError: 'No pudimos actualizar el estado del pedido.',
            }));
            return { success: false };
        }
    },

    openOrderWhatsApp: async (date, orderId) => {
        try {
            const response = await fetchOrderWhatsAppLink(date, orderId);
            if (typeof window !== 'undefined') {
                window.open(response.url, '_blank', 'noopener,noreferrer');
            }

            setStore((prevStore) => ({
                ...prevStore,
                appError: null,
            }));
            return { success: true };
        } catch (error) {
            console.error('Error al abrir WhatsApp del pedido:', error);
            setStore((prevStore) => ({
                ...prevStore,
                appError: error.message || 'No pudimos abrir el comprobante de WhatsApp.',
            }));
            return { success: false };
        }
    },

    confirmarVenta: async () => {
        const snapshot = getStore();
        setStore((prevStore) => ({
            ...prevStore,
            submittingOrder: true,
            appError: null,
            lastCreatedOrder: null,
        }));

        try {
            const { cart, orderForm, session } = snapshot;

            if (!session.isAuthenticated) {
                throw new Error('Inicia sesion para registrar pedidos.');
            }

            if (cart.length === 0) {
                throw new Error('Agrega al menos una pizza al pedido.');
            }

            if (!orderForm.receiverName.trim()) {
                throw new Error('Ingresa quien recibe la pizza.');
            }

            const response = await createSale({
                receiver_name: orderForm.receiverName,
                receiver_phone: orderForm.receiverPhone,
                payment_method: orderForm.paymentMethod,
                notes: orderForm.notes,
                include_shipping: orderForm.includeShipping,
                shipping_cost: Number(orderForm.shippingCost) || 0,
                notify_whatsapp: orderForm.alertChannel === 'whatsapp',
                use_vipper: orderForm.alertChannel === 'vipper',
                vipper_code: orderForm.vipperCode,
                sales: cart,
            });

            const [refreshedSales, refreshedPizzas] = await Promise.all([fetchSales(), fetchPizzas()]);

            setStore((prevStore) => ({
                ...prevStore,
                sales: refreshedSales,
                pizzas: refreshedPizzas,
                cart: [],
                submittingOrder: false,
                lastCreatedOrder: response.order,
                appError: null,
                orderForm: resetOrderForm(),
            }));

            return { success: true, order: response.order };
        } catch (error) {
            console.error('Error al registrar la venta:', error);
            setStore((prevStore) => ({
                ...prevStore,
                submittingOrder: false,
                appError: error.message || 'No pudimos registrar el pedido.',
            }));
            return { success: false };
        }
    },
});

export default getFlux;
