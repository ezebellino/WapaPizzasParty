import { apiRequest } from './client';

export const fetchPizzas = () => apiRequest('/pizzas');

export const updatePizzaAvailability = (pizzaId, available) =>
    apiRequest(`/pizzas/${pizzaId}`, {
        method: 'PATCH',
        body: JSON.stringify({ available }),
    });
