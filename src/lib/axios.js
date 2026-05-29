import axios from 'axios';

// Ensure VITE_APP_URL is normalized (no trailing slash) so we don't end up
// with accidental double-slashes or relative paths when building baseURL.
const rawAppUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
const baseAppUrl = rawAppUrl.toString().trim().replace(/\/+$|\s+$/g, '');

const api = axios.create({
    baseURL: `${baseAppUrl}/api/v1`,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': '69420', // Bypass ngrok interstitial warning
    },
    withCredentials: true,
});

// Auto-attach Bearer token from localStorage on every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 globally — redirect to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If token expired or unauthenticated, clear auth and redirect
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            // Avoid redirect loop if already on login page
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        // If account is deactivated (forbidden), sign the user out to prevent continued access
        if (error.response?.status === 403) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            if (!window.location.pathname.startsWith('/login')) {
                // Add query to indicate blocked state (optional)
                window.location.href = '/login?blocked=1';
            }
        }
        return Promise.reject(error);
    }
);

export default api;