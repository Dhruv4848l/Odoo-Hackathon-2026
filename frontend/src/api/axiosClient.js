import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default axiosClient;
