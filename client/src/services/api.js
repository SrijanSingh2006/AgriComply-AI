import axios from 'axios';

// Dynamically grab the Vercel cloud URL, or fallback to localhost for local testing
const API_BASE_URL = 'https://server-eta-rosy-45.vercel.app';

// Create the axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json', 'Bypass-Tunnel-Reminder': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Add a Request Interceptor
// This runs BEFORE every request is sent
api.interceptors.request.use(
  (config) => {
    // 1. Get the token from LocalStorage
    const token = localStorage.getItem('token');
    
    // 2. If token exists, attach it to the Headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
