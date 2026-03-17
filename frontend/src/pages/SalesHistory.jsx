import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../store/AppContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from '../styles/CustomCalendar.module.css'; // Importa tu archivo CSS personalizado

const SalesHistory = () => {
    const { actions } = useContext(AppContext);
    const [sales, setSales] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        const fetchSales = async () => {
            const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD
            const response = await actions.getSalesByDate(formattedDate);
            if (response) {
                setSales(response.sales);
            } else {
                setSales([]);
            }
        };
        fetchSales();
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

    const getTotalSales = () => {
        return sales.reduce((total, sale) => total + sale.price * sale.quantity, 0);
    };
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4 text-center underline text-yellow-500">Historial de Ventas</h1>
            <div className="flex justify-center mb-4">
                <Calendar onChange={setSelectedDate} value={selectedDate} className={styles['react-calendar']} />
            </div>
            <ul className="space-y-4">
                {sales.length > 0 ? (
                    <>
                        {groupSalesByPizza().map((sale, index) => (
                            <li key={index} className="border-b pb-2 text-center hover:text-cyan-200 hover:animate-pulse">
                                <p className="font-bold">{sale.name} - Cantidad: {sale.quantity}</p>
                                <span>${sale.totalPrice}</span>
                            </li>
                        ))}
                        <p className="text-white border-b-3 pb-2 font-bold text-lg hover:text-violet-400 hover:animate-pulse">
                            Ventas Totales del {formatDate(selectedDate)} = ${getTotalSales()}
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