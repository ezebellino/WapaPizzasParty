import { apiRequest } from './client';

export const fetchSales = () => apiRequest('/ventas/');

export const fetchSalesByDate = (date) => apiRequest(`/ventas/${date}`);

export const createSale = (payload) =>
    apiRequest('/ventas/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const updateOrderStatus = (date, orderId, status) =>
    apiRequest(`/ventas/${date}/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
