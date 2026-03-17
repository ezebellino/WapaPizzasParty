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

const reportClientLog = async ({ level = 'error', message, path = '', details = '' }) => {
    if (!message || path === '/diagnostics/client-log') {
        return;
    }

    try {
        await fetch(buildUrl('/diagnostics/client-log'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                level,
                message,
                source: 'frontend',
                path,
                details,
            }),
        });
    } catch {
        // Evitamos romper la UX si tambien falla el reporte de logs.
    }
};

export const apiRequest = async (path, options = {}) => {
    const token = getAuthToken();
    let response;

    try {
        response = await fetch(buildUrl(path), {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers ?? {}),
            },
            ...options,
        });
    } catch (error) {
        await reportClientLog({
            level: 'error',
            message: 'No se pudo conectar con la API',
            path,
            details: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }

    if (!response.ok) {
        let detail = `La API respondio con estado ${response.status}.`;

        try {
            const errorPayload = await response.json();
            if (typeof errorPayload?.detail === 'string' && errorPayload.detail.trim()) {
                detail = errorPayload.detail;
            }
        } catch {
            // Conservamos el mensaje por estado cuando no llega un JSON valido.
        }

        await reportClientLog({
            level: response.status >= 500 ? 'error' : 'warning',
            message: 'La API devolvio un error',
            path,
            details: detail,
        });

        throw new Error(detail);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

export { API_BASE_URL };
