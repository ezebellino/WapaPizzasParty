import { fetchPizzas, updatePizzaInventory } from '../api/pizzas';
import { createSale, fetchSales, updateOrderStatus } from '../api/sales';

const resetOrderForm = () => ({
    receiverName: '',
    receiverPhone: '',
    paymentMethod: 'efectivo',
    notes: '',
    includeShipping: false,
    shippingCost: 1500,
});

const syncCartWithPizzas = (cart, pizzas) =>
    cart
        .map((item) => {
            const pizza = pizzas.find((candidate) => candidate.id === item.id);
            if (!pizza || !pizza.available || pizza.stock === 0) {
                return null;
            }

            return {
                ...item,
                quantity: Math.min(item.quantity, pizza.stock),
            };
        })
        .filter(Boolean);

const getFlux = (setStore) => ({
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
                [field]: value,
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

    addToCart: (pizza) => {
        if (!pizza.available || pizza.stock === 0) {
            setStore((prevStore) => ({
                ...prevStore,
                appError: `${pizza.name} no tiene stock disponible.`,
            }));
            return;
        }

        setStore((prevStore) => {
            const existingItem = prevStore.cart.find((item) => item.id === pizza.id);
            const reservedQuantity = existingItem?.quantity ?? 0;

            if (reservedQuantity >= pizza.stock) {
                return {
                    ...prevStore,
                    appError: `No puedes agregar mas de ${pizza.stock} unidades de ${pizza.name}.`,
                };
            }

            if (existingItem) {
                return {
                    ...prevStore,
                    appError: null,
                    cart: prevStore.cart.map((item) =>
                        item.id === pizza.id ? { ...item, quantity: item.quantity + 1 } : item
                    ),
                };
            }

            return {
                ...prevStore,
                appError: null,
                cart: [...prevStore.cart, { ...pizza, quantity: 1 }],
            };
        });
    },

    incrementCartItem: (id) => {
        setStore((prevStore) => {
            const pizza = prevStore.pizzas.find((item) => item.id === id);
            const cartItem = prevStore.cart.find((item) => item.id === id);

            if (!pizza || !cartItem || cartItem.quantity >= pizza.stock) {
                return {
                    ...prevStore,
                    appError: pizza ? `No hay mas stock para ${pizza.name}.` : prevStore.appError,
                };
            }

            return {
                ...prevStore,
                appError: null,
                cart: prevStore.cart.map((item) =>
                    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
                ),
            };
        });
    },

    decrementCartItem: (id) => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: prevStore.cart.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            ),
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

    confirmarVenta: async () => {
        let snapshot;
        setStore((prevStore) => {
            snapshot = prevStore;
            return {
                ...prevStore,
                submittingOrder: true,
                appError: null,
                lastCreatedOrder: null,
            };
        });

        try {
            const { cart, orderForm } = snapshot;

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
