import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rfq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauth and token is set, clear
      if (localStorage.getItem('rfq_token')) {
        localStorage.removeItem('rfq_token');
        localStorage.removeItem('rfq_user');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
