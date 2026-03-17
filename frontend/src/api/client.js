const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000';
const AUTH_STORAGE_KEY = 'wapapizzasparty-auth';

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return '';
    }

    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
        return '';
    }

    try {
        const session = JSON.parse(raw);
        return session.accessToken ?? '';
    } catch {
        return '';
    }
};

export const apiRequest = async (path, options = {}) => {
    const token = getAuthToken();
    const response = await fetch(buildUrl(path), {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers ?? {}),
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`La API respondio con estado ${response.status}.`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export { API_BASE_URL };
