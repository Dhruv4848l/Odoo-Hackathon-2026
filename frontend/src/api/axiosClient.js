import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://odoo-hackathon-2026-olkv.onrender.com/api'
    : 'http://localhost:5000/api');

if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && API_BASE_URL.includes('localhost')) {
  console.warn('[EcoSphere Warning] Frontend is running on a live domain but VITE_API_URL points to localhost:', API_BASE_URL);
}

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout to allow for backend cold-starts (e.g. Render/Railway free tier)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject authentication token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecosphere_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle responses and global errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Check for 401 Unauthorized errors to automatically log out user
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ecosphere_token');
      localStorage.removeItem('ecosphere_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    if (!error.response) {
      return Promise.reject({
        message: `Network Error: Unable to connect to server (${API_BASE_URL}). Please verify your backend server is running and VITE_API_URL is configured correctly.`,
      });
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default axiosClient;
