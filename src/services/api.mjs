import axios from 'axios';

const api = axios.create({
  baseURL:  'https://lead-management-backend-bj9q.onrender.com/api',
  withCredentials: true,
});

export default api;