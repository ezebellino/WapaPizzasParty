import React, { useContext, useEffect } from 'react';
import { AppContext } from '../store/AppContext';

const ProductList = () => {
    const { store, actions } = useContext(AppContext);

    useEffect(() => {
        actions.loadProducts();
    }, [actions]);

    return (
        <div>
            <h1>Lista de Productos</h1>
            <ul>
                {store.products.map((product) => (
                    <li key={product.id}>
                        {product.name} - {product.price}$
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductList;
