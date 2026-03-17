import React, { createContext, useState } from 'react';
import getFlux from './flux';

export const AppContext = createContext(null);

const AppProvider = ({ children }) => {
    const [store, setStore] = useState({
        pizzas: [],
        cart: [],
        includeShipping: false,
        sales: [],
    });

    const [actions] = useState(getFlux(setStore));

    return (
        <AppContext.Provider value={{ store, actions }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
