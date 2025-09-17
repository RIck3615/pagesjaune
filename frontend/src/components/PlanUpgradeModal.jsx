import React from 'react';
import { X, Crown, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanUpgradeModal = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  suggestedPlans, 
  currentCount, 
  currentLimit,
  upgradeMessage 
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleUpgrade = (plan) => {
    onClose();
    navigate('/subscription', { 
      state: { 
        selectedPlan: plan,
        upgradeReason: 'business_limit'
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl max-h-screen mx-4 overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Améliorez votre plan
            </h2>
            <p className="mt-1 text-gray-600">
              {upgradeMessage || `Vous avez atteint votre limite de ${currentLimit} entreprise${currentLimit > 1 ? 's' : ''}.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Current Status */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Plan actuel</h3>
              <p className="text-sm text-gray-600">
                {currentPlan ? currentPlan.name : 'Plan Gratuit'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {currentCount}/{currentLimit}
              </div>
              <div className="text-sm text-gray-600">entreprises</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-red-500 rounded-full"
                style={{
                  width: currentLimit === 'Illimité' ? '0%' : 
                         `${Math.min((currentCount / currentLimit) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Suggested Plans */}
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Plans recommandés
          </h3>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {suggestedPlans?.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.is_popular 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute transform -translate-x-1/2 -top-3 left-1/2">
                    <span className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
                      Populaire
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h4 className="mb-2 text-xl font-bold text-gray-900">
                    {plan.name}
                  </h4>
                  <p className="mb-4 text-sm text-gray-600">
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600">
                      /{plan.duration_days === 365 ? 'an' : 'mois'}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="text-lg font-semibold text-blue-600">
                      {plan.business_limit === -1 
                        ? 'Entreprises illimitées' 
                        : `${plan.business_limit} entreprises`}
                    </div>
                  </div>

                  <ul className="mb-6 space-y-2 text-left">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="flex-shrink-0 w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      plan.is_popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Choisir ce plan
                    <ArrowRight className="inline w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="px-6 pb-6">
          <div className="p-4 rounded-lg bg-blue-50">
            <h4 className="mb-2 font-medium text-blue-900">
              Avantages de l'amélioration :
            </h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Créez plus d'entreprises selon votre plan</li>
              <li>• Augmentez votre visibilité avec le statut Premium</li>
              <li>• Accédez aux statistiques avancées</li>
              <li>• Bénéficiez d'un support prioritaire</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Plus tard
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Voir tous les plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanUpgradeModal;
