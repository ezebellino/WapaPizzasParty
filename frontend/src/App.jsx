import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Navbar from './components/Navbar';
import AboutUs from './pages/AboutUs';
import Cart from './components/Cart';
import SalesHistory from './pages/SalesHistory';
import Footer from './components/Footer';
import AboutMe from './pages/AboutMe';
import NotFound from './pages/NotFound';

const App = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-text font-sans">
            <Router>
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/menu" element={<Menu />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/sales-history" element={<SalesHistory />} />
                        <Route path="/about-me" element={<AboutMe />} />
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Footer />
                </main>
            </Router>
        </div>
    );
};

export default App;
