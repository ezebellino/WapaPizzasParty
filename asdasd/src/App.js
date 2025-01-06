import React from 'react';
import ProductList from './components/ProductList';
import AppProvider from './store/AppContext';

function App() {
    return (
        <AppProvider>
            <div>
                <h1>Sistema de Inventario</h1>
                <ProductList />
            </div>
        </AppProvider>
    );
}

export default App;
