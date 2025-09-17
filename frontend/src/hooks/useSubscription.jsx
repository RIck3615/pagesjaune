import { useState, useEffect, useContext, createContext } from 'react'
import { subscriptionService } from '../services/subscriptionService'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const SubscriptionContext = createContext()

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const [plans, setPlans] = useState([])
  const [currentSubscription, setCurrentSubscription] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user, isAuthenticated } = useAuth()

  // Fonction pour calculer les limites d'abonnement
  const getSubscriptionLimits = (actualBusinessCount = null) => {
    if (!isAuthenticated || !user) {
      return {
        currentLimit: 1,
        usedCount: 0,
        canCreateBusiness: false,
        remainingSlots: 0
      }
    }

    // Utiliser le nombre réel d'entreprises si fourni, sinon utiliser user.businesses
    const usedCount = actualBusinessCount !== null ? actualBusinessCount : (user.businesses?.length || 0);

    // Si l'utilisateur n'a pas d'abonnement actif, utiliser les limites par défaut
    if (!currentSubscription?.subscription?.plan) {
      return {
        currentLimit: 1,
        usedCount,
        canCreateBusiness: usedCount < 1,
        remainingSlots: Math.max(0, 1 - usedCount)
      }
    }

    const plan = currentSubscription.subscription.plan
    const businessLimit = plan.business_limit === -1 ? Infinity : plan.business_limit
    const canCreateBusiness = businessLimit === Infinity || usedCount < businessLimit
    const remainingSlots = businessLimit === Infinity ? -1 : Math.max(0, businessLimit - usedCount)

    return {
      currentLimit: businessLimit === Infinity ? 'Illimité' : businessLimit,
      usedCount,
      canCreateBusiness,
      remainingSlots
    }
  }

  const limits = getSubscriptionLimits()

  // Charger les plans d'abonnement
  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await subscriptionService.getPlans()
      setPlans(response.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des plans:', error)
      setError('Erreur lors du chargement des plans')
    } finally {
      setLoading(false)
    }
  }

  // Charger l'abonnement actuel de l'utilisateur
  const loadCurrentSubscription = async () => {
    if (!isAuthenticated) return

    try {
      setLoading(true)
      const response = await subscriptionService.getCurrentSubscription()
      setCurrentSubscription(response.data || null)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'abonnement:', error)
      // Ne pas afficher d'erreur si l'utilisateur n'a pas d'abonnement
      if (error.response?.status !== 404) {
        setError('Erreur lors du chargement de l\'abonnement')
      }
    } finally {
      setLoading(false)
    }
  }

  // S'abonner à un plan
  const subscribe = async (planId, paymentMethod) => {
    try {
      setLoading(true)
      const response = await subscriptionService.subscribe(planId, paymentMethod)
      setCurrentSubscription(response.data)
      toast.success('Abonnement activé avec succès !')
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'abonnement'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Choisir un plan avec redirection appropriée
  const selectPlan = async (planId, paymentMethod = null) => {
    try {
      setLoading(true)
      
      console.log(' Sélection du plan:', planId, 'Méthode de paiement:', paymentMethod)
      
      // Trouver le plan sélectionné
      const selectedPlan = plans.find(plan => plan.id === planId)
      
      if (!selectedPlan) {
        throw new Error('Plan non trouvé')
      }
      
      console.log('📋 Plan trouvé:', selectedPlan.name, 'Prix:', selectedPlan.price, 'Slug:', selectedPlan.slug)
      
      // Détecter si c'est un plan gratuit (plusieurs conditions pour être sûr)
      const isFreePlan = selectedPlan.price === 0 || 
                        selectedPlan.price === '0' || 
                        selectedPlan.price === 0.00 || 
                        selectedPlan.slug === 'free' ||
                        selectedPlan.name.toLowerCase().includes('gratuit')
      
      console.log(' Plan gratuit détecté:', isFreePlan)
      
      // Si c'est le plan gratuit
      if (isFreePlan) {
        console.log('✅ Plan gratuit détecté, activation directe...')
        
        // Activer directement le plan gratuit
        const response = await subscriptionService.subscribe(planId, 'free')
        console.log('🎉 Plan gratuit activé:', response.data)
        
        setCurrentSubscription(response.data)
        
        // Rediriger vers le dashboard
        return { 
          success: true, 
          redirectTo: '/dashboard',
          message: 'Plan gratuit activé avec succès ! Vous allez être redirigé vers votre tableau de bord.',
          isFreePlan: true,
          plan: selectedPlan
        }
      } else {
        console.log('💰 Plan payant détecté, redirection vers paiement...')
        
        // Pour les plans payants, rediriger vers l'écran de paiement
        return { 
          success: true, 
          redirectTo: '/payment',
          planId: planId,
          plan: selectedPlan,
          message: 'Redirection vers l\'écran de paiement',
          isFreePlan: false
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du plan:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de la sélection du plan'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Annuler l'abonnement
  const cancelSubscription = async () => {
    try {
      setLoading(true)
      await subscriptionService.cancelSubscription()
      setCurrentSubscription(null)
      toast.success('Abonnement annulé avec succès')
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'annulation'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Recharger les données
  const refreshData = async () => {
    await Promise.all([
      loadPlans(),
      loadCurrentSubscription()
    ])
  }

  useEffect(() => {
    loadPlans()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentSubscription()
    } else {
      setCurrentSubscription(null)
    }
  }, [isAuthenticated, user?.id])

  const value = {
    plans,
    currentSubscription,
    loading,
    error,
    ...limits,
    subscribe,
    selectPlan,
    cancelSubscription,
    refreshData
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}