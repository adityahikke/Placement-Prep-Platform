import axios from 'axios';

const getBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (!url || url.trim() === '') {
    if (import.meta.env.PROD) {
      throw new Error('VITE_API_BASE_URL must be configured for production builds');
    }
    return '/api';
  }
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
};

const API_BASE_URL = getBaseUrl();

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token automatically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for auth errors
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, clear local auth
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session_expired=true';
      }
    }
    const message = error.response?.data?.message
      || (error.code === 'ECONNABORTED'
        ? 'The server took too long to respond. Please try again.'
        : error.code === 'ERR_NETWORK'
          ? 'Unable to reach the PlacementPrep server. Please try again shortly.'
          : error.message || 'An unexpected error occurred');
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
