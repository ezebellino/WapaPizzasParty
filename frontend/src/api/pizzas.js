import { apiRequest } from './client';

export const fetchPizzas = () => apiRequest('/pizzas');

export const createPizza = (payload) =>
    apiRequest('/pizzas', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const updatePizza = (pizzaId, payload) =>
    apiRequest(`/pizzas/${pizzaId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
