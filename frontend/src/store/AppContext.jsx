import React, { createContext, useState } from 'react';
import getFlux from './flux';

export const AppContext = createContext(null);

const AppProvider = ({ children }) => {
    const [store, setStore] = useState({
        pizzas: [],
        sales: [],
        cart: [],
        pizzasLoading: false,
        salesLoading: false,
        submittingOrder: false,
        appError: null,
        lastCreatedOrder: null,
        orderForm: {
            receiverName: '',
            receiverPhone: '',
            paymentMethod: 'efectivo',
            notes: '',
            includeShipping: false,
            shippingCost: 1500,
        },
    });

    const [actions] = useState(getFlux(setStore));

    return (
        <AppContext.Provider value={{ store, actions }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
