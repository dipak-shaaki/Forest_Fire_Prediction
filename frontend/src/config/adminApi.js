import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// Add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchAlerts = () => API.get('/alerts');
export const createAlert = (data) => API.post('/alerts', data);
export const updateAlert = (id, data) => API.put(`/alerts/${id}`, data);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);
