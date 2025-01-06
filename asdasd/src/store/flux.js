const getFlux = (setStore) => ({
    loadProducts: async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/products/');
            const data = await response.json();
            setStore((prevStore) => ({ ...prevStore, products: data }));
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    },

    addProduct: async (product) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/products/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            if (response.ok) {
                const newProduct = await response.json();
                setStore((prevStore) => ({
                    ...prevStore,
                    products: [...prevStore.products, newProduct],
                }));
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    },
});

export default getFlux;
