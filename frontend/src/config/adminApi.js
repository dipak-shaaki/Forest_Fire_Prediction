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

export const fetchAlerts = () => API.get('/admin/alerts');
export const createAlert = (data) => API.post('/admin/alerts', data);
export const updateAlert = (id, data) => API.put(`/admin/alerts/${id}`, data);
export const deleteAlert = (id) => API.delete(`/admin/alerts/${id}`);
