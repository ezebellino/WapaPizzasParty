import { fetchPizzas } from '../api/pizzas';
import { createSale, fetchSales, fetchSalesByDate } from '../api/sales';

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
                appError: 'No pudimos cargar el historial de ventas.',
            }));
        }
    },

    getSalesByDate: async (date) => {
        try {
            return await fetchSalesByDate(date);
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }

            console.error('Error al obtener ventas:', error);
            setStore((prevStore) => ({
                ...prevStore,
                appError: 'No pudimos consultar las ventas para esa fecha.',
            }));
            return null;
        }
    },

    confirmarVenta: async () => {
        try {
            const snapshot = await new Promise((resolve) => {
                setStore((prevStore) => {
                    resolve(prevStore);
                    return prevStore;
                });
            });

            if (snapshot.cart.length === 0) {
                return false;
            }

            const totalRevenue = snapshot.cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                snapshot.includeShipping ? 1000 : 0
            );

            await createSale({
                sales: snapshot.cart,
                total_revenue: totalRevenue,
            });

            setStore((prevStore) => ({
                ...prevStore,
                cart: [],
                includeShipping: false,
                appError: null,
            }));

            return true;
        } catch (error) {
            console.error('Error al registrar la venta:', error);
            setStore((prevStore) => ({
                ...prevStore,
                appError: 'No pudimos registrar la venta.',
            }));
            return false;
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
            }));
        } catch (error) {
            console.error('Error al cargar pizzas:', error);
            setStore((prevStore) => ({
                ...prevStore,
                pizzasLoading: false,
                appError: 'No pudimos cargar el menu de pizzas.',
            }));
        }
    },

    addToCart: (pizza) => {
        setStore((prevStore) => {
            const existingItem = prevStore.cart.find((item) => item.id === pizza.id);

            if (existingItem) {
                return {
                    ...prevStore,
                    cart: prevStore.cart.map((item) =>
                        item.id === pizza.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            return {
                ...prevStore,
                cart: [...prevStore.cart, { ...pizza, quantity: 1 }],
            };
        });
    },

    removeToCart: (id) => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: prevStore.cart.filter((item) => item.id !== id),
        }));
    },

    updateCartQuantity: (id, quantity) => {
        setStore((prevStore) => ({
            ...prevStore,
            cart: prevStore.cart.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, parseInt(quantity, 10) || 1) } : item
            ),
        }));
    },

    toggleShipping: () => {
        setStore((prevStore) => ({
            ...prevStore,
            includeShipping: !prevStore.includeShipping,
        }));
    },
});

export default getFlux;
