const getFlux = (setStore) => ({
    loadSales: async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/ventas/");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setStore((prevStore) => ({ ...prevStore, sales: data }));
        } catch (error) {
            console.error("Error al cargar ventas:", error);
        }
    },

    getSalesByDate: async (date) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/ventas/${date}`);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error("Error al obtener ventas:", error);
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

            const totalRevenue = snapshot.cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                snapshot.includeShipping ? 1000 : 0
            );

            const response = await fetch("http://127.0.0.1:8000/ventas/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sales: snapshot.cart,
                    total_revenue: totalRevenue,
                }),
            });

            if (!response.ok) {
                throw new Error("Error al registrar la venta");
            }

            setStore((prevStore) => ({
                ...prevStore,
                cart: [],
                includeShipping: false,
            }));

            return true;
        } catch (error) {
            console.error("Error al registrar la venta:", error);
            return false;
        }
    },

    loadPizzas: async () => {
        try {
            const response = await fetch("http://127.0.0.1:8000/pizzas");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setStore((prevStore) => ({ ...prevStore, pizzas: data }));
        } catch (error) {
            console.error("Error al cargar pizzas:", error);
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
