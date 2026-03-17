import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AppContext } from './store/AppContext';
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import SalesHistory from './pages/SalesHistory';

const App = () => {
    const { store, actions } = useContext(AppContext);

    useEffect(() => {
        if (store.session.accessToken) {
            actions.hydrateSession();
        }
    }, [actions, store.session.accessToken]);

    return (
        <Router>
            <div className="min-h-screen bg-background text-text">
                <Navbar />
                <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tesoreria"
                            element={
                                <ProtectedRoute>
                                    <SalesHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/menu" element={<Navigate to="/" replace />} />
                        <Route path="/cart" element={<Navigate to="/" replace />} />
                        <Route path="/sales-history" element={<Navigate to="/tesoreria" replace />} />
                        <Route path="/about-us" element={<Navigate to="/" replace />} />
                        <Route path="/about-me" element={<Navigate to="/" replace />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
