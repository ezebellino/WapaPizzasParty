import React, { createContext, useEffect, useRef, useState } from 'react';
import getFlux from './flux';

const AUTH_STORAGE_KEY = 'wapapizzasparty-auth';

const emptySession = {
    isAuthenticated: false,
    role: null,
    name: '',
    username: '',
    accessToken: '',
};

const getInitialSession = () => {
    if (typeof window === 'undefined') {
        return emptySession;
    }

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return emptySession;
    }

    try {
        return {
            ...emptySession,
            ...JSON.parse(raw),
        };
    } catch {
        return emptySession;
    }
};

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
        session: getInitialSession(),
        orderForm: {
            receiverName: '',
            receiverPhone: '',
            paymentMethod: 'efectivo',
            notes: '',
            includeShipping: false,
            shippingCost: 1500,
            alertChannel: 'none',
            notifyWhatsApp: false,
            vipperCode: '',
        },
    });
    const storeRef = useRef(store);

    useEffect(() => {
        storeRef.current = store;
    }, [store]);

    const [actions] = useState(getFlux(setStore, () => storeRef.current, AUTH_STORAGE_KEY));

    return (
        <AppContext.Provider value={{ store, actions }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppProvider;
