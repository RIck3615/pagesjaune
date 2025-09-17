import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Zap, Crown, Building2, BarChart3, MessageCircle, Headphones } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const ChoosePlan = () => {
  const navigate = useNavigate()
  const { plans, loading, selectPlan } = useSubscription()
  const { user, isAuthenticated } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('stripe')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async () => {
    if (!selectedPlan) return

    // Rediriger vers la connexion si pas authentifié
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setSubscribing(true)
    try {
      console.log(' Début de la sélection du plan:', selectedPlan.name, 'Prix:', selectedPlan.price)
      
      const result = await selectPlan(selectedPlan.id, paymentMethod)
      
      console.log('📋 Résultat de selectPlan:', result)
      
      if (result.success) {
        toast.success(result.message)
        
        // Rediriger selon le type de plan
        if (result.redirectTo === '/dashboard') {
          console.log('✅ Redirection vers le dashboard')
          // Plan gratuit - redirection directe
          navigate('/dashboard')
        } else if (result.redirectTo === '/payment') {
          console.log('💰 Redirection vers le paiement')
          // Plan payant - redirection vers paiement avec les données du plan
          navigate('/payment', { 
            state: { 
              plan: result.plan,
              planId: result.planId 
            } 
          })
        } else {
          console.log('❓ Redirection inconnue:', result.redirectTo)
          // Fallback vers le dashboard
          navigate('/dashboard')
        }
      } else {
        console.log('❌ Échec de la sélection du plan:', result)
        toast.error(result.message || 'Erreur lors de la sélection du plan')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du plan:', error)
      // Le toast d'erreur est déjà géré dans selectPlan
    } finally {
      setSubscribing(false)
    }
  }

  // Fonction pour détecter si un plan est gratuit
  const isFreePlan = (plan) => {
    return plan.price === 0 || plan.price === '0' || plan.price === 0.00 || plan.slug === 'free'
  }

  const getPlanIcon = (slug) => {
    switch (slug) {
      case 'free':
        return <Building2 className="w-8 h-8" />
      case 'starter':
        return <Zap className="w-8 h-8" />
      case 'professional':
        return <Star className="w-8 h-8" />
      case 'enterprise':
        return <Crown className="w-8 h-8" />
      default:
        return <Building2 className="w-8 h-8" />
    }
  }

  const getPlanColor = (slug) => {
    switch (slug) {
      case 'free':
        return 'from-gray-500 to-gray-600'
      case 'starter':
        return 'from-blue-500 to-blue-600'
      case 'professional':
        return 'from-purple-500 to-purple-600'
      case 'enterprise':
        return 'from-yellow-500 to-yellow-600'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Choisissez votre plan d'abonnement
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600">
            {isAuthenticated ? (
              <>Bienvenue {user?.name} ! Sélectionnez le plan qui correspond le mieux à vos besoins pour commencer à gérer vos entreprises.</>
            ) : (
              <>Sélectionnez le plan qui correspond le mieux à vos besoins. Vous devrez vous connecter pour finaliser votre abonnement.</>
            )}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                selectedPlan?.id === plan.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${plan.is_popular ? 'ring-2 ring-yellow-400' : ''}`}
            >
              {/* Badge populaire */}
              {plan.is_popular && (
                <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                  <span className="px-4 py-1 text-sm font-semibold text-yellow-900 bg-yellow-400 rounded-full">
                    Populaire
                  </span>
                </div>
              )}

              {/* Badge gratuit */}
              {isFreePlan(plan) && (
                <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                  <span className="px-4 py-1 text-sm font-semibold text-green-900 bg-green-400 rounded-full">
                    Gratuit
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Icône et nom */}
                <div className="mb-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor(plan.slug)} text-white mb-4`}>
                    {getPlanIcon(plan.slug)}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-gray-600">{plan.description}</p>
                </div>

                {/* Prix */}
                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center">
                    {isFreePlan(plan) ? (
                      <span className="text-5xl font-bold text-green-600">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-5xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="ml-2 text-gray-600">
                          /{plan.duration_days === 365 ? 'an' : 'mois'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div className="mb-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Bouton de sélection */}
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    selectedPlan?.id === plan.id
                      ? 'bg-blue-600 text-white'
                      : isFreePlan(plan)
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan?.id === plan.id ? 'Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Méthode de paiement - Seulement pour les plans payants */}
        {selectedPlan && !isFreePlan(selectedPlan) && isAuthenticated && (
          <div className="max-w-md mx-auto mb-8">
            <h3 className="mb-4 text-lg font-semibold text-center text-gray-900">
              Méthode de paiement
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'stripe', name: 'Stripe', icon: '💳' },
                { id: 'paypal', name: 'PayPal', icon: '🅿️' },
                { id: 'mobile_money', name: 'Mobile Money', icon: '💰' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-2 text-2xl">{method.icon}</div>
                  <div className="text-sm font-medium">{method.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bouton de confirmation */}
        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`px-8 py-4 text-lg font-semibold text-white transition-all duration-200 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                isFreePlan(selectedPlan) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {subscribing ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Traitement...
                </div>
              ) : !isAuthenticated ? (
                'Se connecter pour s\'abonner'
              ) : isFreePlan(selectedPlan) ? (
                `Activer le plan ${selectedPlan.name} gratuitement`
              ) : (
                `Confirmer l'abonnement ${selectedPlan.name}`
              )}
            </button>
          </div>
        )}

        {/* Message pour le plan gratuit */}
        {selectedPlan && isFreePlan(selectedPlan) && (
          <div className="max-w-md p-4 mx-auto mt-4 text-center border border-green-200 rounded-lg bg-green-50">
            <p className="text-sm text-green-800">
              ✅ Le plan gratuit sera activé immédiatement et vous serez redirigé vers votre tableau de bord.
            </p>
          </div>
        )}

        {/* Informations supplémentaires */}
        <div className="mt-16 text-center">
          <h3 className="mb-6 text-2xl font-bold text-gray-900">
            Pourquoi choisir nos plans ?
          </h3>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">Analytics avancés</h4>
              <p className="text-gray-600">
                Suivez les performances de vos entreprises avec des statistiques détaillées
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-green-100 rounded-full">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">Chat illimité</h4>
              <p className="text-gray-600">
                Communiquez sans limite avec vos clients via notre système de chat
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-purple-100 rounded-full">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="mb-2 text-lg font-semibold text-gray-900">Support prioritaire</h4>
              <p className="text-gray-600">
                Bénéficiez d'un support client prioritaire selon votre plan
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChoosePlan
