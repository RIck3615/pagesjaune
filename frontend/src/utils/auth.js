// Utilitaires d'authentification
export const authUtils = {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Obtenir le token d'authentification
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Obtenir les informations de l'utilisateur
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Sauvegarder les informations d'authentification
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Supprimer les informations d'authentification
  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est admin
  isAdmin: () => {
    const user = authUtils.getUser();
    return user?.role === 'admin';
  },

  // Vérifier si l'utilisateur est une entreprise
  isBusiness: () => {
    const user = authUtils.getUser();
    return user?.role === 'business';
  },

  // Vérifier si l'utilisateur peut gérer une entreprise
  canManageBusiness: (businessUserId) => {
    const user = authUtils.getUser();
    return user?.id === businessUserId || user?.role === 'admin';
  },
};

