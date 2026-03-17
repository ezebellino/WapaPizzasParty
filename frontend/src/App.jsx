import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SalesHistory from './pages/SalesHistory';

const App = () => {
    return (
        <Router>
            <div className="min-h-screen bg-background text-text">
                <Navbar />
                <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/tesoreria" element={<SalesHistory />} />
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
