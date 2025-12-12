import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000/api'; 


const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});


api.interceptors.request.use(
    (config) => {
        // Preluăm token-ul din sessionStorage (sesiune pe tab)
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