import axios from 'axios';

// prefer proxy in development, but if it's not working we can hit the backend directly
// determine base URL for API calls based on environment variable
// if VITE_BACKEND_URL is provided (in dev or prod) use it; otherwise fall
// back to relative `/api` which works when backend is co-hosted.
let backendBase = import.meta.env.VITE_BACKEND_URL || '';
if (!backendBase && import.meta.env.DEV) {
  console.warn('VITE_BACKEND_URL not set; using dev proxy (/api)');
}
if (backendBase) {
  // strip trailing slash if present
  backendBase = backendBase.replace(/\/+$/, '');
}

const api = axios.create({
  baseURL: backendBase ? `${backendBase}/api` : '/api',
  headers: { 'Content-Type': 'application/json' }
});

// log out the final base URL for easier debugging
console.log('axios baseURL =', api.defaults.baseURL);

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle auth errors
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

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

// Users
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getContactPersons: () => api.get('/users/contact-persons'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

// Visitors
export const visitorsApi = {
  getAll: (params) => api.get('/visitors', { params }),
  getById: (id) => api.get(`/visitors/${id}`),
  create: (data) => api.post('/visitors', data),
  uploadPhoto: (id, formData) => api.patch(`/visitors/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  checkout: (id, data) => api.patch(`/visitors/${id}/checkout`, data),
  updateMeeting: (id, data) => api.patch(`/visitors/${id}/meeting`, data),
  getStats: () => api.get('/visitors/stats/summary'),
  downloadReport: (params) => api.get('/visitors/report/download', {
    params,
    responseType: 'blob'
  }),
};

// Roles
export const rolesApi = {
  getAll: () => api.get('/roles'),
};

export default api;
