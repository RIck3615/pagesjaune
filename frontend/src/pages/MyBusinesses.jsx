import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Phone,
  Building2,
  MoreVertical,
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { businessService } from '../services/api';
import { formatUtils } from '../utils/format';
import { getImageUrl } from '../utils/images';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import PlanUpgradeModal from '../components/PlanUpgradeModal';

const MyBusinesses = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitData, setLimitData] = useState(null);

  const { user } = useAuth();
  const { 
    currentSubscription, 
    refreshData 
  } = useSubscription();

  // Charger les données complètes de l'abonnement et des limites
  useEffect(() => {
    loadBusinessData();
  }, []);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Charger les entreprises
      const businessesResponse = await businessService.getMyBusinesses();
      setBusinesses(businessesResponse.data.data || []);
      
      // Charger les données d'abonnement et de limites
      await Promise.all([
        refreshData(), // Recharger les données d'abonnement
        loadLimitData()
      ]);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement de vos données');
    } finally {
      setLoading(false);
    }
  };

  const loadLimitData = async () => {
    try {
      const response = await businessService.checkLimits();
      if (response.data.success) {
        setLimitData(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error);
    }
  };

  // Calculer les limites basées sur les vraies données du backend
  const getBusinessLimits = () => {
    if (!user || user.role !== 'business') {
      return {
        currentLimit: 0,
        usedCount: 0,
        remainingSlots: 0,
        currentPlan: null,
        isEnterprise: false,
        isHighestPlan: false
      };
    }

    // Utiliser les données du backend si disponibles
    if (limitData) {
      const usedCount = businesses.length;
      const currentLimit = limitData.current_limit;
      const currentPlan = limitData.current_plan;
      const remainingSlots = limitData.remaining_slots;
      const isEnterprise = currentPlan?.business_limit === -1;
      const isHighestPlan = currentPlan?.name === 'Enterprise';

      return {
        currentLimit: currentLimit === -1 ? 'Illimité' : currentLimit,
        usedCount,
        remainingSlots: remainingSlots === -1 ? -1 : remainingSlots,
        currentPlan,
        isEnterprise,
        isHighestPlan
      };
    }

    // Fallback sur les données locales si pas de données du backend
    const usedCount = businesses.length;
    let currentLimit = 1; // Plan gratuit par défaut
    let currentPlan = null;
    let isEnterprise = false;
    let isHighestPlan = false;

    if (currentSubscription?.subscription?.plan) {
      currentPlan = currentSubscription.subscription.plan;
      currentLimit = currentPlan.business_limit === -1 ? 'Illimité' : currentPlan.business_limit;
      isEnterprise = currentPlan.business_limit === -1;
      isHighestPlan = currentPlan.name === 'Enterprise';
    }

    const remainingSlots = isEnterprise ? -1 : Math.max(0, currentLimit - usedCount);

    return {
      currentLimit,
      usedCount,
      remainingSlots,
      currentPlan,
      isEnterprise,
      isHighestPlan
    };
  };

  const businessLimits = getBusinessLimits();

  const handleDelete = async (businessId) => {
    if (!deleteConfirm || deleteConfirm !== businessId) {
      setDeleteConfirm(businessId);
      return;
    }

    try {
      await businessService.delete(businessId);
      setBusinesses(businesses.filter(b => b.id !== businessId));
      setDeleteConfirm(null);
      
      // Recharger les données de limites après suppression
      await loadLimitData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'entreprise');
    }
  };

  const handleUpgradeClick = async () => {
    try {
      // Recharger les données de limites pour avoir les dernières informations
      await loadLimitData();
      setShowUpgradeModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des limites:', error);
      navigate('/subscription');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement de vos entreprises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Erreur</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <button
            onClick={loadBusinessData}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes entreprises</h1>
              <p className="mt-2 text-gray-600">
                Gérez vos fiches d'entreprise et suivez leurs performances
              </p>
            </div>
            
            <Link
              to="/business/new"
              className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une entreprise
            </Link>
          </div>

          {/* Barre de progression des limites avec vraies données */}
          {user?.role === 'business' && (
            <div className="p-6 mb-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Limite d'entreprises
                    </h3>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-600">
                        Plan actuel : 
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        businessLimits.isEnterprise 
                          ? 'bg-purple-100 text-purple-800' 
                          : businessLimits.currentPlan?.price === 0 || !businessLimits.currentPlan
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {businessLimits.isEnterprise && <Crown className="w-3 h-3 mr-1" />}
                        {businessLimits.currentPlan?.name || 'Plan Gratuit'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {businessLimits.usedCount} / {businessLimits.currentLimit}
                  </div>
                  <div className="text-sm text-gray-600">
                    {businessLimits.currentLimit === 'Illimité' ? 'entreprises' : 'entreprises utilisées'}
                  </div>
                </div>
              </div>
              
              {/* Barre de progression */}
              {businessLimits.currentLimit !== 'Illimité' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Utilisation
                    </span>
                    <span className="text-sm text-gray-500">
                      {businessLimits.remainingSlots === -1 
                        ? 'Illimité' 
                        : `${businessLimits.remainingSlots} restante${businessLimits.remainingSlots > 1 ? 's' : ''}`
                      }
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div
                      className="h-3 transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.min((businessLimits.usedCount / businessLimits.currentLimit) * 100, 100)}%`,
                        backgroundColor: businessLimits.usedCount >= businessLimits.currentLimit 
                          ? '#ef4444' // Rouge si limite atteinte
                          : businessLimits.usedCount >= businessLimits.currentLimit * 0.8 
                          ? '#f59e0b' // Orange si proche de la limite
                          : '#2563eb' // Bleu normal
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Messages d'information améliorés */}
              {businessLimits.remainingSlots === 0 && businessLimits.currentLimit !== 'Illimité' && (
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="flex-shrink-0 w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        Limite atteinte !
                      </p>
                      <p className="mt-1 text-sm text-red-700">
                        Vous avez utilisé toutes vos entreprises. 
                        <button
                          onClick={handleUpgradeClick}
                          className="ml-1 font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          Améliorez votre plan
                        </button> pour créer plus d'entreprises.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {businessLimits.remainingSlots > 0 && businessLimits.currentLimit !== 'Illimité' && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="flex-shrink-0 w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">
                        Espace disponible
                      </p>
                      <p className="mt-1 text-sm text-blue-700">
                        Vous pouvez encore créer <strong>{businessLimits.remainingSlots}</strong> entreprise{businessLimits.remainingSlots > 1 ? 's' : ''}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {businessLimits.isEnterprise && (
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-start space-x-3">
                    <Crown className="flex-shrink-0 w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-800">
                        Plan Enterprise - Accès illimité
                      </p>
                      <p className="mt-1 text-sm text-purple-700">
                        Vous pouvez créer un nombre illimité d'entreprises. C'est le plan le plus élevé disponible.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bouton d'amélioration pour les plans non-Enterprise */}
              {!businessLimits.isEnterprise && !businessLimits.isHighestPlan && (
                <div className="mt-4">
                  <button
                    onClick={handleUpgradeClick}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 transition-colors bg-blue-100 rounded-lg hover:bg-blue-200"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Découvrir les plans supérieurs
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Liste des entreprises */}
          {businesses && businesses.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {businesses.map((business) => (
                <div key={business.id} className="transition-shadow bg-white rounded-lg shadow-md hover:shadow-lg">
                  <div className="p-6">
                    {/* En-tête de la carte */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {business.logo ? (
                          <img
                            src={getImageUrl(business.logo)}
                            alt={business.name}
                            className="object-cover w-12 h-12 rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                            <span className="text-lg font-semibold text-gray-500">
                              {business.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {business.name}
                          </h3>
                          <div className="flex items-center mt-1 space-x-2">
                            {business.is_verified && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                ✓ Vérifié
                              </span>
                            )}
                            {business.is_premium && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                ⭐ Premium
                              </span>
                            )}
                            {!business.is_active && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                                Inactif
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu d'actions */}
                      <div className="relative">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                      {formatUtils.truncate(business.description, 100)}
                    </p>

                    {/* Informations de contact */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="line-clamp-1">
                          {business.city}, {business.province}
                        </span>
                      </div>
                      
                      {business.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{formatUtils.phone(business.phone)}</span>
                        </div>
                      )}
                    </div>

                    {/* Note et avis */}
                    {business.reviews_count > 0 && (
                      <div className="flex items-center mb-4 space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < business.average_rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {business.average_rating?.toFixed(1)} ({business.reviews_count} avis)
                        </span>
                      </div>
                    )}

                    {/* Catégories */}
                    {business.categories && business.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {business.categories.slice(0, 2).map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                          >
                            {category.name}
                          </span>
                        ))}
                        {business.categories.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                            +{business.categories.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/business/${business.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Voir les détails"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/business/${business.id}/edit`}
                          className="p-2 text-gray-400 hover:text-green-600"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(business.id)}
                          className={`p-2 ${
                            deleteConfirm === business.id
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                          title={deleteConfirm === business.id ? 'Confirmer la suppression' : 'Supprimer'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <span className="text-xs text-gray-500">
                        Créé le {formatUtils.date(business.created_at)}
                      </span>
                    </div>

                    {/* Confirmation de suppression */}
                    {deleteConfirm === business.id && (
                      <div className="p-3 mt-4 border border-red-200 rounded-md bg-red-50">
                        <p className="mb-2 text-sm text-red-800">
                          Êtes-vous sûr de vouloir supprimer cette entreprise ?
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDelete(business.id)}
                            className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 text-xs text-gray-700 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* État vide */
            <div className="py-12 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Aucune entreprise
              </h3>
              <p className="mb-6 text-gray-600">
                Commencez par ajouter votre première entreprise pour augmenter votre visibilité
              </p>
              <Link
                to="/business/new"
                className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter ma première entreprise
              </Link>
            </div>
          )}

          {/* Statistiques */}
          {businesses && businesses.length > 0 && (
            <div className="p-6 mt-8 bg-white rounded-lg shadow">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Statistiques</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{businesses.length}</div>
                  <div className="text-sm text-gray-600">Entreprises</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {businesses.filter(b => b.is_verified).length}
                  </div>
                  <div className="text-sm text-gray-600">Vérifiées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {businesses.filter(b => b.is_premium).length}
                  </div>
                  <div className="text-sm text-gray-600">Premium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {businesses.reduce((acc, b) => acc + (b.reviews_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Avis total</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Upgrade Modal */}
      <PlanUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlan={limitData?.current_plan}
        suggestedPlans={limitData?.suggested_plans}
        currentCount={limitData?.current_count}
        currentLimit={limitData?.current_limit}
        upgradeMessage={limitData?.upgrade_message}
      />
    </>
  );
};

export default MyBusinesses;