import { apiRequest } from './client';

export const fetchPizzas = () => apiRequest('/pizzas');

export const updatePizzaInventory = (pizzaId, payload) =>
    apiRequest(`/pizzas/${pizzaId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
    });
