import axios from 'axios';
const API_URL = 'https://transfinity-backend.onrender.com/api';

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Helper to unwrap DRF paginated or non-paginated responses
const unwrap = (res) => {
  const data = res.data;
  // If paginated: { count, next, previous, results: [...] }
  if (data && Array.isArray(data.results)) return data.results;
  // If plain array
  if (Array.isArray(data)) return data;
  // Fallback
  return [];
};

export const getNotifications = async () => {
  const res = await API.get('/notifications/');
  return { ...res, data: unwrap(res) };
};

export const markAsRead = (id) => API.post(`/notifications/${id}/read/`);
export const markAllAsRead = () => API.post('/notifications/read-all/');
export const getUnreadCount = () => API.get('/notifications/unread-count/');