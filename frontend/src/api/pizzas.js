import { apiRequest } from './client';

export const fetchPizzas = () => apiRequest('/pizzas');
