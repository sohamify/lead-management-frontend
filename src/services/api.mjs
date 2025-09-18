// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://lead-management-backend-bj9q.onrender.com/api', 
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Helper functions for token management
export const setToken = (token) => {
  localStorage.setItem('jwt_token', token);
};

export const getToken = () => {
  return localStorage.getItem('jwt_token');
};

export const removeToken = () => {
  localStorage.removeItem('jwt_token');
};

// Request interceptor to add token to headers
api.interceptors.request.use((config) => {
  console.log('Request:', config.url, config.params, 'withCredentials:', config.withCredentials);
  
  // Add token to Authorization header as fallback
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Added token to Authorization header');
  }
  
  return config;
}, (error) => {
  console.error('Request error:', error);
  return Promise.reject(error);
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('Response success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.response?.data, 'Headers:', error.response?.headers);
    
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401) {
      removeToken();
      // You might want to redirect to login page here
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token from response as fallback
      if (response.data.token) {
        setToken(response.data.token);
        console.log('Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Store token from response as fallback
      if (response.data.token) {
        setToken(response.data.token);
        console.log('Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
      removeToken();
      console.log('Logged out and token removed');
    } catch (error) {
      console.error('Logout error:', error);
      // Remove token even if logout request fails
      removeToken();
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
};

export default api;