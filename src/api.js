import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// Helper pour construire les URLs adaptées à l'architecture flat
export const authAPI = {
  login:    (data) => api.post('/auth?action=login', data),
  register: (data) => api.post('/auth?action=register', data),
  me:       ()     => api.get('/auth?action=me'),
};

export const produitsAPI = {
  list:   (params) => api.get('/produits', { params }),
  get:    (id)     => api.get('/produits', { params: { id } }),
  create: (data)   => api.post('/produits', data),
  update: (id, data) => api.put('/produits', data, { params: { id } }),
  delete: (id)     => api.delete('/produits', { params: { id } }),
};

export const ventesAPI = {
  list:      (params) => api.get('/ventes', { params }),
  create:    (data)   => api.post('/ventes', data),
  statsJour: ()       => api.get('/ventes', { params: { stats: 'jour' } }),
};

export const usersAPI = {
  list:       ()            => api.get('/users'),
  setRole:    (id, role)    => api.put('/users', { role },  { params: { id, action: 'role' } }),
  setActif:   (id, actif)   => api.put('/users', { actif }, { params: { id, action: 'actif' } }),
};

export default api;
