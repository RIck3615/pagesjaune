import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  MessageCircle, 
  Plus, 
  Edit, 
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Crown,
  AlertTriangle,
  CheckCircle,
  Lock
} from 'lucide-react';
import { businessService, reviewService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatUtils } from '../utils/format';
import { getImageUrl } from '../utils/images';
import { useSubscription } from '../hooks/useSubscription';
import PlanUpgradeModal from '../components/PlanUpgradeModal';

const Dashboard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitData, setLimitData] = useState(null);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
  });

  const { user } = useAuth();
  const { 
    currentSubscription, 
    refreshData 
  } = useSubscription();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (user?.role === 'business') {
        // Charger les entreprises de l'utilisateur
        const businessesResponse = await businessService.getMyBusinesses();
        const businessesData = businessesResponse.data?.data || businessesResponse.data || [];
        setBusinesses(Array.isArray(businessesData) ? businessesData : []);

        // Charger les avis reçus
        const reviewsResponse = await reviewService.getMyReviews();
        const reviewsData = reviewsResponse.data?.data || reviewsResponse.data || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        // Calculer les statistiques
        const safeBusinessesData = Array.isArray(businessesData) ? businessesData : [];
        const safeReviewsData = Array.isArray(reviewsData) ? reviewsData : [];

        setStats({
          totalBusinesses: safeBusinessesData.length,
          totalReviews: safeReviewsData.length,
          averageRating: safeBusinessesData.length > 0 
            ? safeBusinessesData.reduce((acc, business) => acc + (business.average_rating || 0), 0) / safeBusinessesData.length 
            : 0,
          totalViews: 0, // À implémenter si nécessaire
        });

        // Charger les données de limites
        await Promise.all([
          refreshData(),
          loadLimitData()
        ]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
      // Réinitialiser les données en cas d'erreur
      setBusinesses([]);
      setReviews([]);
      setStats({
        totalBusinesses: 0,
        totalReviews: 0,
        averageRating: 0,
        totalViews: 0,
      });
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
        isHighestPlan: false,
        canCreate: false
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
      const canCreate = limitData.can_create || false;

      return {
        currentLimit: currentLimit === -1 ? 'Illimité' : currentLimit,
        usedCount,
        remainingSlots: remainingSlots === -1 ? -1 : remainingSlots,
        currentPlan,
        isEnterprise,
        isHighestPlan,
        canCreate
      };
    }

    // Fallback sur les données locales si pas de données du backend
    const usedCount = businesses.length;
    let currentLimit = 1; // Plan gratuit par défaut
    let currentPlan = null;
    let isEnterprise = false;
    let isHighestPlan = false;
    let canCreate = true; // Par défaut, permettre la création

    if (currentSubscription?.subscription?.plan) {
      currentPlan = currentSubscription.subscription.plan;
      currentLimit = currentPlan.business_limit === -1 ? 'Illimité' : currentPlan.business_limit;
      isEnterprise = currentPlan.business_limit === -1;
      isHighestPlan = currentPlan.name === 'Enterprise';
      canCreate = isEnterprise || usedCount < currentLimit;
    } else {
      // Plan gratuit par défaut
      canCreate = usedCount < 1;
    }

    const remainingSlots = isEnterprise ? -1 : Math.max(0, currentLimit - usedCount);

    return {
      currentLimit,
      usedCount,
      remainingSlots,
      currentPlan,
      isEnterprise,
      isHighestPlan,
      canCreate
    };
  };

  const businessLimits = getBusinessLimits();

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

  const handleAddBusinessClick = () => {
    if (!businessLimits.canCreate) {
      handleUpgradeClick();
      return;
    }
    navigate('/business/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full border-primary-600 animate-spin"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* En-tête */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="mt-2 text-gray-600">
              Bienvenue, {user?.name} ! Gérez vos entreprises et suivez vos performances.
            </p>
          </div>

          {user?.role === 'business' ? (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                <div className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-primary-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Entreprises</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalBusinesses}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Note moyenne</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {(stats.averageRating || 0).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avis reçus</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalReviews}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Vues totales</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations d'abonnement améliorées */}
              <div className="p-6 mb-8 bg-white border border-gray-200 rounded-lg shadow-sm">
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
                            : 'bg-primary-100 text-primary-800'
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
                {!businessLimits.canCreate && businessLimits.currentLimit !== 'Illimité' && (
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
                            className="ml-1 font-medium underline text-primary-600 hover:text-primary-800"
                          >
                            Améliorez votre plan
                          </button> pour créer plus d'entreprises.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {businessLimits.canCreate && businessLimits.currentLimit !== 'Illimité' && (
                  <div className="p-4 border rounded-lg border-primary-200 bg-primary-50">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="flex-shrink-0 w-5 h-5 text-primary-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-primary-800">
                          Espace disponible
                        </p>
                        <p className="mt-1 text-sm text-primary-700">
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
                      className="inline-flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-lg text-primary-700 bg-primary-100 hover:bg-primary-200"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Découvrir les plans supérieurs
                    </button>
                  </div>
                )}
              </div>

              {/* Actions rapides avec boutons intelligents */}
              <div className="p-6 mb-8 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions rapides</h2>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/my-businesses"
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Gérer mes entreprises
                  </Link>
                  
                  {/* Bouton Ajouter une entreprise avec vérification des limites */}
                  <button
                    onClick={handleAddBusinessClick}
                    disabled={!businessLimits.canCreate}
                    className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                      businessLimits.canCreate
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                    }`}
                    title={
                      businessLimits.canCreate 
                        ? 'Ajouter une nouvelle entreprise' 
                        : 'Limite atteinte - Améliorez votre plan pour créer plus d\'entreprises'
                    }
                  >
                    {businessLimits.canCreate ? (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une entreprise
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Limite atteinte
                      </>
                    )}
                  </button>
                  
                  <Link
                    to="/choose-plan"
                    className="inline-flex items-center px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Passer en Premium
                  </Link>
                  <Link
                    to="/subscription"
                    className="inline-flex items-center px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Mon abonnement
                  </Link>
                </div>
              </div>

              {/* Mes entreprises récentes */}
              <div className="p-6 mb-8 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Mes entreprises</h2>
                  <Link
                    to="/my-businesses"
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    Voir toutes
                  </Link>
                </div>

                {businesses && businesses.length > 0 ? (
                  <div className="space-y-4">
                    {businesses.slice(0, 3).map((business) => (
                      <div key={business.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {business.logo ? (
                            <img
                              src={getImageUrl(business.logo)}
                              alt={business.name}
                              className="object-cover w-12 h-12 rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                              <span className="font-semibold text-gray-500">
                                {business.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          
                          <div>
                            <h3 className="font-medium text-gray-900">{business.name || 'Nom non disponible'}</h3>
                            <p className="text-sm text-gray-600">{business.city || ''}, {business.province || ''}</p>
                            <div className="flex items-center mt-1 space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${
                                      i < (business.average_rating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {(business.average_rating || 0).toFixed(1)} ({business.reviews_count || 0} avis)
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/business/${business.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/business/${business.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Aucune entreprise</h3>
                    <p className="mb-4 text-gray-600">
                      Commencez par ajouter votre première entreprise
                    </p>
                    <button
                      onClick={handleAddBusinessClick}
                      disabled={!businessLimits.canCreate}
                      className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                        businessLimits.canCreate
                          ? 'text-white bg-primary-600 hover:bg-primary-700'
                          : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                      }`}
                      title={
                        businessLimits.canCreate 
                          ? 'Ajouter votre première entreprise' 
                          : 'Limite atteinte - Améliorez votre plan pour créer plus d\'entreprises'
                      }
                    >
                      {businessLimits.canCreate ? (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter une entreprise
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Limite atteinte
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Avis récents */}
              <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Avis récents</h2>
                  <Link
                    to="/my-reviews"
                    className="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    Voir tous
                  </Link>
                </div>

                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {review.business?.name || 'Entreprise inconnue'}
                            </span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < (review.rating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {review.created_at ? formatUtils.relativeDate(review.created_at) : 'Date inconnue'}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="mb-2 text-lg font-medium text-gray-900">Aucun avis</h3>
                    <p className="text-gray-600">
                      Vous n'avez pas encore reçu d'avis
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Dashboard utilisateur standard */
            <div className="p-6 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Bienvenue sur PagesJaunes.cd
              </h2>
              <p className="mb-6 text-gray-600">
                Découvrez les meilleures entreprises de la République Démocratique du Congo.
              </p>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Link
                  to="/search"
                  className="p-6 transition-shadow border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md"
                >
                  <Building2 className="w-8 h-8 mb-4 text-primary-600" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Rechercher des entreprises
                  </h3>
                  <p className="text-gray-600">
                    Trouvez facilement les services dont vous avez besoin
                  </p>
                </Link>
                
                <Link
                  to="/categories"
                  className="p-6 transition-shadow border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md"
                >
                  <MapPin className="w-8 h-8 mb-4 text-green-600" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    Explorer par catégorie
                  </h3>
                  <p className="text-gray-600">
                    Parcourez les entreprises par secteur d'activité
                  </p>
                </Link>
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

export default Dashboard;