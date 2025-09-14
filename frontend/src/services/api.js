import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Gérer FormData automatiquement
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Erreur 401 détectée, mais on ne nettoie pas automatiquement le localStorage')
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Services des entreprises
export const businessService = {
  getAll: (params = {}) => api.get('/businesses', { params }),
  getById: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => {
    // Utiliser POST avec _method=PUT pour FormData
    if (data instanceof FormData) {
      data.append('_method', 'PUT');
      return api.post(`/businesses/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/businesses/${id}`, data);
  },
  delete: (id) => api.delete(`/businesses/${id}`),
  getMyBusinesses: () => api.get('/my-businesses'),
};

// Service d'autocomplétion optimisé
export const autocompleteService = {
  getSuggestions: (query, type = 'business') => {
    // Debounce côté client aussi
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(api.get('/autocomplete', { 
          params: { q: query, type },
          timeout: 5000 // Timeout de 5 secondes
        }));
      }, 100);
    });
  },
};

// Services des catégories
export const categoryService = {
  getAll: (params = {}) => api.get('/categories', { params }),
  getTree: () => api.get('/categories/tree'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/admin/categories', data),
  update: (id, data) => api.put(`/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

// Services des avis
export const reviewService = {
  // Récupérer tous les avis (pour l'admin)
  getAll: (params = {}) => api.get('/reviews', { params }),
  
  // Récupérer les avis d'une entreprise
  getReviews: (businessId) => api.get(`/businesses/${businessId}/reviews`),
  
  // Créer un avis
  create: (data) => api.post('/reviews', data),
  
  // Mettre à jour un avis
  update: (id, data) => api.put(`/reviews/${id}`, data),
  
  // Supprimer un avis
  delete: (id) => api.delete(`/reviews/${id}`),
  
  // Récupérer mes avis
  getMyReviews: () => api.get('/my-reviews'),
  
  // Modérer un avis (admin)
  moderate: (id, data) => api.put(`/admin/reviews/${id}/moderate`, data),
};

// Services d'administration
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getBusinesses: (params = {}) => api.get('/admin/businesses', { params }),
  updateBusiness: (id, data) => api.put(`/admin/businesses/${id}`, data),
  getReviews: (params = {}) => api.get('/admin/reviews', { params }),
  moderateReview: (id, status) => api.put(`/admin/reviews/${id}/moderate`, { status }),
};

export default api;