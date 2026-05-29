import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbHost = import.meta.env.VITE_REVERB_HOST ?? window.location.hostname;
const reverbPort = import.meta.env.VITE_REVERB_PORT ?? (window.location.protocol === 'https:' ? 443 : 80);
const reverbScheme = (import.meta.env.VITE_REVERB_SCHEME || (window.location.protocol === 'https:' ? 'https' : 'http')).toString();
const isSecure = reverbScheme === 'https' || Number(reverbPort) === 443;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: reverbHost,
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS: isSecure,
    enabledTransports: isSecure ? ['wss'] : ['ws'],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                // Dynamically leverage our project APP URL or fallback to localhost
                const baseUrl = import.meta.env.VITE_APP_URL || 'http://localhost:8000';
                // Normalize to clean broadcasting auth endpoint
                axios.post(`${baseUrl.trim().replace(/\/$/, '')}/api/v1/broadcasting/auth`, {
                    socket_id: socketId,
                    channel_name: channel.name
                }, {
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('auth_token'),
                        'Accept': 'application/json',
                    }
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
});
