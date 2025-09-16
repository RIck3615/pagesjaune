import api from './api'

export const subscriptionService = {
  // Récupérer tous les plans d'abonnement
  getPlans: async () => {
    const response = await api.get('/subscription-plans')
    return response.data
  },

  // Récupérer l'abonnement actuel de l'utilisateur
  getCurrentSubscription: async () => {
    const response = await api.get('/my-subscription')
    return response.data
  },

  // S'abonner à un plan
  subscribe: async (planId, paymentMethod) => {
    const response = await api.post('/subscribe', {
      plan_id: planId,
      payment_method: paymentMethod
    })
    return response.data
  },

  // Annuler l'abonnement
  cancelSubscription: async () => {
    const response = await api.post('/cancel-subscription')
    return response.data
  },

  // Récupérer l'historique des paiements
  getPaymentHistory: async () => {
    const response = await api.get('/payment-history')
    return response.data
  }
}
