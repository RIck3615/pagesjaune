import api from './api';

export const statsService = {
  // Enregistrer une visite
  recordVisit: (data) => api.post('/stats/visitors', data),
  
  // Obtenir le nombre de visiteurs d'aujourd'hui
  getTodayCount: () => api.get('/stats/visitors/today'),
  
  // Obtenir le nombre total de visiteurs
  getTotalCount: () => api.get('/stats/visitors/total'),
  
  // Obtenir les statistiques des 7 derniers jours
  getWeeklyStats: () => api.get('/stats/visitors/weekly'),
};
