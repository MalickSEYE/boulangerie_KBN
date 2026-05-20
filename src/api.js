import axios from 'axios';

// En production Vercel : les fonctions sont sur /api/...
// En dev local (vite proxy) : même chose grâce au proxy vite.config.js
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// Injecte automatiquement le token Bearer
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers /login si le token expire (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
