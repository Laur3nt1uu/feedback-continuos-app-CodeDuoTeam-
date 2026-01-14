// Mic helper care construiește URL-ul pentru API și configurează axios.
// Îl folosim peste tot ca să nu scriem baseURL manual în componente.
import axios from 'axios';

const addApiSuffix = (url) => {
    if (!url) return url;
    const hasApi = /\/api\/?$/.test(url);
    if (hasApi) return url.replace(/\/$/, '');
    return url.endsWith('/') ? `${url}api` : `${url}/api`;
};

const renderBackendFallback = 'https://feedback-app-backend.onrender.com/api';

let API_BASE_URL = process.env.REACT_APP_BASE_URL;

if (API_BASE_URL) {
    API_BASE_URL = addApiSuffix(API_BASE_URL);
}

if (!API_BASE_URL && typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    const isRenderFrontend = window.location.hostname.endsWith('onrender.com');
    API_BASE_URL = isRenderFrontend ? renderBackendFallback : addApiSuffix(origin);
}

// When deployed as static site on Render, the frontend origin serves only static assets;
// fall back to the backend service domain if we don't have a better hint.
if (!API_BASE_URL && typeof window !== 'undefined' && window.location.hostname.endsWith('onrender.com')) {
    API_BASE_URL = renderBackendFallback;
}

if (!API_BASE_URL) {
    API_BASE_URL = 'http://localhost:5000/api';
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('userToken'); 

        if (token) {
            
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
        
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            
            sessionStorage.removeItem('userToken');
            sessionStorage.removeItem('userProfile');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userProfile');
            
            
        }
        return Promise.reject(error);
    }
);

export default api;