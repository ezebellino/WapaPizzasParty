import React, { useContext, useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AppContext } from '../store/AppContext';
import styles from '../styles/CustomCalendar.module.css';

const SalesHistory = () => {
    const { store, actions } = useContext(AppContext);
    const [sales, setSales] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadSalesForDate = async () => {
            setLoading(true);
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const response = await actions.getSalesByDate(formattedDate);
            setSales(response?.sales ?? []);
            setLoading(false);
        };

        loadSalesForDate();
    }, [selectedDate, actions]);

    const groupSalesByPizza = () => {
        const groupedSales = {};

        sales.forEach((sale) => {
            if (groupedSales[sale.name]) {
                groupedSales[sale.name].quantity += sale.quantity;
                groupedSales[sale.name].totalPrice += sale.price * sale.quantity;
            } else {
                groupedSales[sale.name] = {
                    name: sale.name,
                    quantity: sale.quantity,
                    totalPrice: sale.price * sale.quantity,
                };
            }
        });

        return Object.values(groupedSales);
    };

    const getTotalSales = () => sales.reduce((total, sale) => total + sale.price * sale.quantity, 0);

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-4 text-center text-2xl font-bold text-yellow-500 underline">Historial de ventas</h1>
            <div className="mb-4 flex justify-center">
                <Calendar onChange={setSelectedDate} value={selectedDate} className={styles['react-calendar']} />
            </div>
            <ul className="space-y-4">
                {store.appError ? (
                    <p className="text-center text-red-400">{store.appError}</p>
                ) : loading ? (
                    <p className="text-center text-gray-500">Cargando ventas...</p>
                ) : sales.length > 0 ? (
                    <>
                        {groupSalesByPizza().map((sale) => (
                            <li key={sale.name} className="border-b pb-2 text-center hover:animate-pulse hover:text-cyan-200">
                                <p className="font-bold">{sale.name} - Cantidad: {sale.quantity}</p>
                                <span>${sale.totalPrice}</span>
                            </li>
                        ))}
                        <p className="border-b-3 pb-2 text-lg font-bold text-white hover:animate-pulse hover:text-violet-400">
                            Ventas totales del {formatDate(selectedDate)} = ${getTotalSales()}
                        </p>
                    </>
                ) : (
                    <p className="text-center text-gray-500">No hay ventas registradas en esta fecha.</p>
                )}
            </ul>
        </div>
    );
};

export default SalesHistory;
