// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lead-management-backend-bj9q.onrender.com', // Match your backend URL
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // Enable sending cookies (JWT)
});

// Optional: Add request/response interceptors for debugging
api.interceptors.request.use((config) => {
  console.log('Request:', config.url, config.params, config.headers);
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;