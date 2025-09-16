import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../hooks/useAuth'

const SubscriptionManagement = () => {
  const navigate = useNavigate()
  const { currentSubscription, loading, cancelSubscription } = useSubscription()
  const { user, isAuthenticated } = useAuth()
  const [cancelling, setCancelling] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // Rediriger vers la connexion si pas authentifié
  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  const handleCancelSubscription = async () => {
    setCancelling(true)
    try {
      const result = await cancelSubscription()
      if (result.success) {
        setShowCancelConfirm(false)
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
    } finally {
      setCancelling(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      case 'expired':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'cancelled':
        return 'Annulé'
      case 'expired':
        return 'Expiré'
      default:
        return status
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
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion de l'abonnement</h1>
          <p className="mt-2 text-gray-600">
            Gérez votre abonnement et consultez vos informations de facturation
          </p>
        </div>

        {currentSubscription ? (
          <div className="space-y-6">
            {/* Informations de l'abonnement */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Abonnement actuel
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentSubscription.subscription.status)}`}>
                  {getStatusText(currentSubscription.subscription.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {currentSubscription.subscription.plan.name}
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {currentSubscription.subscription.plan.description}
                  </p>
                  <div className="text-2xl font-bold text-gray-900">
                    ${currentSubscription.subscription.plan.price}
                    <span className="text-sm font-normal text-gray-600">
                      /{currentSubscription.subscription.plan.duration_days === 365 ? 'an' : 'mois'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Début de l'abonnement</span>
                    <p className="text-gray-900">
                      {formatDate(currentSubscription.subscription.starts_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Expiration</span>
                    <p className="text-gray-900">
                      {formatDate(currentSubscription.subscription.expires_at)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Jours restants</span>
                    <p className="text-gray-900">
                      {currentSubscription.days_remaining} jours
                    </p>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités incluses */}
              <div className="mt-6">
                <h4 className="mb-3 text-lg font-semibold text-gray-900">
                  Fonctionnalités incluses
                </h4>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {currentSubscription.subscription.plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="flex-shrink-0 w-4 h-4 mr-2 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {currentSubscription.subscription.status === 'active' && (
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 text-red-600 transition-colors duration-200 border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    Annuler l'abonnement
                  </button>
                </div>
              )}
            </div>

            {/* Statistiques d'utilisation */}
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Utilisation actuelle
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Entreprises créées</span>
                    <span className="text-sm text-gray-900">
                      {user?.businesses?.length || 0} / {currentSubscription.subscription.plan.business_limit === -1 ? '∞' : currentSubscription.subscription.plan.business_limit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-blue-600 rounded-full"
                      style={{
                        width: `${currentSubscription.subscription.plan.business_limit === -1 ? 100 : Math.min((user?.businesses?.length || 0) / currentSubscription.subscription.plan.business_limit * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Emplacements restants</span>
                    <span className="text-sm text-gray-900">
                      {currentSubscription.remaining_business_slots}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Aucun abonnement actif
            </h3>
            <p className="mb-6 text-gray-600">
              Vous n'avez pas d'abonnement actif. Vous pouvez créer une entreprise gratuitement.
            </p>
            <a
              href="/choose-plan"
              className="inline-flex items-center px-6 py-3 text-white transition-colors duration-200 bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Voir les plans disponibles
            </a>
          </div>
        )}

        {/* Modal de confirmation d'annulation */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
              <div className="flex items-center mb-4">
                <X className="w-6 h-6 mr-2 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Annuler l'abonnement
                </h3>
              </div>
              <p className="mb-6 text-gray-600">
                Êtes-vous sûr de vouloir annuler votre abonnement ? Cette action est irréversible et vous perdrez l'accès aux fonctionnalités premium.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 transition-colors duration-200 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelling}
                  className="flex-1 px-4 py-2 text-white transition-colors duration-200 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Annulation...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscriptionManagement
