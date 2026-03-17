import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AppContext } from '../store/AppContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { store } = useContext(AppContext);

    if (!store.session.isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && store.session.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
