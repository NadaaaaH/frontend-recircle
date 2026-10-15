import axios from 'axios';

// 1. Berikan fallback URL EC2 langsung agar aplikasi TIDAK crash jika env Vercel belum terbaca
const rawAppUrl = import.meta.env.VITE_API_BASE_URL || 'https://tumbuhberbagi.duckdns.org/recircle/api/v1';
const baseAppUrl = rawAppUrl.toString().trim().replace(/\/+$\vert{}\s+$/g, '');

// 2. Mencegah duplikasi '/api/v1' jika di env Vercel sudah ditulis '/api/v1'
const finalBaseUrl = baseAppUrl.endsWith('/api/v1')
    ? baseAppUrl
    : `${baseAppUrl}/api/v1`;

const api = axios.create({
    baseURL: finalBaseUrl,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': '69420',
    },
    withCredentials: true,
});

// Auto-attach Bearer token dari localStorage
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

// Handle 401 & 403 globally — redirect ke login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        if (error.response?.status === 403) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login?blocked=1';
            }
        }
        return Promise.reject(error);
    }
);

export default api;