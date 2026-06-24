import axios from 'axios';

const API_BASE_URL = 'http://localhost:5287/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth ---
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// --- Menu ---
export const menuService = {
  getAllDrinks: () => api.get('/menu'),
  getDrinkById: (id) => api.get(`/menu/${id}`),
  addDrink: (data) => api.post('/menu', data),
  updateDrink: (id, data) => api.put(`/menu/${id}`, data),
  deleteDrink: (id) => api.delete(`/menu/${id}`),
  uploadImage: (formData) => api.post('/menu/upload-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// --- Feedback ---
export const feedbackService = {
  submitFeedback: (data) => api.post('/feedback', data),
  getAllFeedbacks: (sentiment) => api.get('/feedback', { params: sentiment ? { sentiment } : {} }),
  updateStatus: (id, data) => api.put(`/feedback/${id}/status`, data),
  replyToFeedback: (id, data) => api.post(`/feedback/${id}/reply`, data),
};

// --- Recommendations ---
export const recommendationService = {
  getRecommendations: (customerId) => api.get(`/recommendations/${customerId}`),
};

// --- Reports ---
export const reportService = {
  getDashboardStats: () => api.get('/reports/summary'),
  getSummaryReport: (from, to) => api.get('/reports/summary', { params: { from, to } }),
  exportReport: (format, from, to) => api.get('/reports/export', { params: { format, from, to }, responseType: 'blob' }),
};

// --- AI Config ---
export const aiConfigService = {
  getConfig: () => api.get('/aiconfig'),
  updateConfig: (data) => api.put('/aiconfig', data),
};

// --- Users (Admin only) ---
export const userService = {
  getAllUsers: () => api.get('/users'),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// --- Orders ---
export const orderService = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getAllOrders: () => api.get('/orders'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export default api;
