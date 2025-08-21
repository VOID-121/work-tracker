import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  uploadAvatar: (formData) => api.post('/auth/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Work Entries API
export const workEntriesAPI = {
  getAll: (params = {}) => api.get('/work-entries', { params }),
  getById: (id) => api.get(`/work-entries/${id}`),
  create: (data) => api.post('/work-entries', data),
  update: (id, data) => api.put(`/work-entries/${id}`, data),
  delete: (id) => api.delete(`/work-entries/${id}`),
  getStats: () => api.get('/work-entries/stats/summary'),
};

// Notes API
export const notesAPI = {
  getAll: (params = {}) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
  archive: (id) => api.put(`/notes/${id}/archive`),
  pin: (id) => api.put(`/notes/${id}/pin`),
  getArchived: () => api.get('/notes/archived'),
  getStats: () => api.get('/notes/stats/summary'),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  getWorkEntries: (params = {}) => api.get('/admin/work-entries', { params }),
  deleteWorkEntry: (id) => api.delete(`/admin/work-entries/${id}`),
  getNotes: (params = {}) => api.get('/admin/notes', { params }),
  deleteNote: (id) => api.delete(`/admin/notes/${id}`),
};

// Password API
export const passwordsAPI = {
  getAll: (params = {}) => api.get('/passwords', { params }),
  getById: (id) => api.get(`/passwords/${id}`),
  create: (data) => api.post('/passwords', data),
  update: (id, data) => api.put(`/passwords/${id}`, data),
  delete: (id) => api.delete(`/passwords/${id}`),
  getStats: () => api.get('/passwords/stats/summary'),
};

export default api;
