import { apiRequest } from './client';

export const loginRequest = (payload) =>
    apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

export const localAccessRequest = () =>
    apiRequest('/auth/local-access', {
        method: 'POST',
    });

export const meRequest = () => apiRequest('/auth/me');
