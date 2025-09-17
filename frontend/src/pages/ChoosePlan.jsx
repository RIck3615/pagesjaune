import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Star, Zap, Crown, Building2, BarChart3, MessageCircle, Headphones, Clock } from 'lucide-react'
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
          // Redirection par défaut
          navigate(result.redirectTo || '/dashboard')
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du plan:', error)
      // L'erreur est déjà gérée dans selectPlan
    } finally {
      setSubscribing(false)
    }
  }

  const isFreePlan = (plan) => {
    return plan.price === 0 || plan.price === null || plan.slug === 'free'
  }

  // Filtrer pour ne montrer que le plan gratuit
  const availablePlans = plans.filter(plan => isFreePlan(plan))

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
              <>Bienvenue {user?.name} ! Commencez gratuitement avec notre plan de base.</>
            ) : (
              <>Commencez gratuitement avec notre plan de base. Vous devrez vous connecter pour finaliser votre abonnement.</>
            )}
          </p>
          
          {/* Message temporaire pour les plans payants */}
          <div className="max-w-2xl p-4 mx-auto mt-6 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-center justify-center space-x-2 text-blue-800">
              <Clock className="w-5 h-5" />
              <span className="text-sm font-medium">
                Les plans payants (Premium, Professional, Enterprise) seront bientôt disponibles !
              </span>
            </div>
          </div>
        </div>

        {/* Plans Grid - Centré pour un seul plan */}
        <div className="flex justify-center mb-12">
          <div className="grid max-w-md grid-cols-1 gap-8 md:grid-cols-1 lg:grid-cols-1">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${plan.is_popular ? 'ring-2 ring-yellow-400' : ''}`}
              >
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
                  <div className="mb-8">
                    <ul className="space-y-4">
                      {plan.features?.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bouton de sélection */}
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      selectedPlan?.id === plan.id
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {selectedPlan?.id === plan.id ? 'Sélectionné' : 'Sélectionner ce plan'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plans payants désactivés - Section informative */}
        <div className="mb-12">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900">
            Plans payants bientôt disponibles
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Plan Starter désactivé */}
            <div className="relative bg-gray-100 border-2 border-gray-200 shadow-lg rounded-2xl opacity-60">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-20 rounded-2xl"></div>
              <div className="relative p-8">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Starter</h3>
                  <p className="mt-2 text-gray-600">Pour les petites entreprises</p>
                </div>
                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$19</span>
                    <span className="ml-2 text-gray-600">/mois</span>
                  </div>
                </div>
                <div className="mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">5 entreprises</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Statistiques de base</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Support email</span>
                    </li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full px-6 py-3 font-semibold text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
                >
                  Bientôt disponible
                </button>
              </div>
            </div>

            {/* Plan Professional désactivé */}
            <div className="relative bg-gray-100 border-2 border-gray-200 shadow-lg rounded-2xl opacity-60">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-20 rounded-2xl"></div>
              <div className="relative p-8">
                <div className="absolute transform -translate-x-1/2 -top-4 left-1/2">
                  <span className="px-4 py-1 text-sm font-semibold text-yellow-900 bg-yellow-400 rounded-full">
                    Populaire
                  </span>
                </div>
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
                  <p className="mt-2 text-gray-600">Pour les entreprises en croissance</p>
                </div>
                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$49</span>
                    <span className="ml-2 text-gray-600">/mois</span>
                  </div>
                </div>
                <div className="mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">25 entreprises</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Statistiques avancées</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Support prioritaire</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">API d'intégration</span>
                    </li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full px-6 py-3 font-semibold text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
                >
                  Bientôt disponible
                </button>
              </div>
            </div>

            {/* Plan Enterprise désactivé */}
            <div className="relative bg-gray-100 border-2 border-gray-200 shadow-lg rounded-2xl opacity-60">
              <div className="absolute inset-0 bg-gray-900 bg-opacity-20 rounded-2xl"></div>
              <div className="relative p-8">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 mb-4 text-white rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600">
                    <Crown className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
                  <p className="mt-2 text-gray-600">Pour les grandes entreprises</p>
                </div>
                <div className="mb-6 text-center">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">$99</span>
                    <span className="ml-2 text-gray-600">/mois</span>
                  </div>
                </div>
                <div className="mb-8">
                  <ul className="space-y-4">
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Entreprises illimitées</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Analytics personnalisées</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Support 24/7</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="flex-shrink-0 w-5 h-5 mr-3 text-green-500" />
                      <span className="text-gray-700">Intégration personnalisée</span>
                    </li>
                  </ul>
                </div>
                <button
                  disabled
                  className="w-full px-6 py-3 font-semibold text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
                >
                  Bientôt disponible
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subscribing ? (
                <>
                  <div className="w-5 h-5 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Traitement en cours...
                </>
              ) : (
                <>
                  {isFreePlan(selectedPlan) ? 'Commencer gratuitement' : 'Choisir ce plan'}
                  <Check className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
            <p className="mt-4 text-sm text-gray-600">
              {isFreePlan(selectedPlan) 
                ? 'Aucune carte de crédit requise. Commencez immédiatement !'
                : 'Vous serez redirigé vers la page de paiement sécurisée.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChoosePlan
