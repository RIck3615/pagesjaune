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
    const user = localStorage.getItem('auth_user');
    if (!user || user === 'undefined' || user === 'null') {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      return null;
    }
  },

  // Sauvegarder les informations d'authentification
  setAuth: (token, user) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  // Supprimer les informations d'authentification
  clearAuth: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

