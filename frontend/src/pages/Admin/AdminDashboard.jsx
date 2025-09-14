import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService, reviewService } from '../../services/api';
import { 
  Users, 
  Building2, 
  MessageCircle, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react';
import { formatUtils } from '../../utils/format';
import { getImageUrl } from '../../utils/images';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('businesses'); // Nouvel état pour les onglets
  const [reviewStatusFilter, setReviewStatusFilter] = useState('pending'); // Filtre pour les avis
  const [reviewSearchTerm, setReviewSearchTerm] = useState(''); // Recherche dans les avis
  const queryClient = useQueryClient();

  // Fetch dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminService.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fetch businesses
  const { data: businessesData, isLoading: businessesLoading } = useQuery(
    ['admin-businesses', searchTerm, statusFilter, currentPage],
    () => adminService.getBusinesses({
      search: searchTerm,
      status: statusFilter,
      page: currentPage
    }),
    {
      select: (response) => response.data.data,
    }
  );

  // Fetch reviews
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery(
    ['admin-reviews', reviewStatusFilter, reviewSearchTerm, currentPage],
    () => reviewService.getAll({
      status: reviewStatusFilter,
      search: reviewSearchTerm,
      page: currentPage
    }),
    {
      select: (response) => response.data.data,
    }
  );

  const businesses = businessesData?.data || [];
  const reviews = reviewsData?.data || [];

  // Mutations pour les entreprises
  const verifyBusinessMutation = useMutation(
    (businessId) => adminService.updateBusiness(businessId, { is_verified: true }),
    {
      onSuccess: () => {
        toast.success('Entreprise vérifiée avec succès');
        queryClient.invalidateQueries(['admin-businesses']);
        loadDashboardData();
      },
      onError: (error) => {
        toast.error('Erreur lors de la vérification');
        console.error('Erreur:', error);
      }
    }
  );

  const unverifyBusinessMutation = useMutation(
    (businessId) => adminService.updateBusiness(businessId, { is_verified: false }),
    {
      onSuccess: () => {
        toast.success('Entreprise non vérifiée');
        queryClient.invalidateQueries(['admin-businesses']);
        loadDashboardData();
      },
      onError: (error) => {
        toast.error('Erreur lors de la modification');
        console.error('Erreur:', error);
      }
    }
  );

  const togglePremiumMutation = useMutation(
    ({ businessId, isPremium }) => adminService.updateBusiness(businessId, { is_premium: isPremium }),
    {
      onSuccess: () => {
        toast.success('Statut premium modifié');
        queryClient.invalidateQueries(['admin-businesses']);
        loadDashboardData();
      },
      onError: (error) => {
        toast.error('Erreur lors de la modification');
        console.error('Erreur:', error);
      }
    }
  );

  // Mutations pour les avis
  const moderateReviewMutation = useMutation(
    ({ reviewId, status }) => reviewService.moderate(reviewId, status),
    {
      onSuccess: (response, variables) => {
        const statusText = variables.status === 'approved' ? 'approuvé' : 'rejeté';
        toast.success(`Avis ${statusText} avec succès`);
        queryClient.invalidateQueries(['admin-reviews']);
        queryClient.invalidateQueries(['reviews']);
        loadDashboardData();
      },
      onError: (error) => {
        toast.error('Erreur lors de la modération');
        console.error('Erreur:', error);
      }
    }
  );

  const handleVerify = (businessId) => {
    verifyBusinessMutation.mutate(businessId);
  };

  const handleUnverify = (businessId) => {
    unverifyBusinessMutation.mutate(businessId);
  };

  const handleTogglePremium = (businessId, currentStatus) => {
    togglePremiumMutation.mutate({ businessId, isPremium: !currentStatus });
  };

  const handleModerateReview = (reviewId, status) => {
    moderateReviewMutation.mutate({ reviewId, status });
  };

  const getReviewStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'En attente',
        icon: Clock
      },
      approved: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Approuvé',
        icon: CheckCircle
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Rejeté',
        icon: XCircle
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
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
            onClick={loadDashboardData}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_businesses } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
          <p className="mt-2 text-gray-600">
            Gérez les entreprises et modérez les avis
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_users || 0}</p>
                <p className="text-xs text-gray-500">
                  utilisateurs inscrits
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entreprises</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_businesses || 0}</p>
                <p className="text-xs text-gray-500">
                  entreprises enregistrées
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avis</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.total_reviews || 0}</p>
                <p className="text-xs text-gray-500">
                  avis clients
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.premium_businesses || 0}</p>
                <p className="text-xs text-gray-500">
                  entreprises premium
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('businesses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'businesses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="inline w-4 h-4 mr-2" />
                Gestion des entreprises
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageCircle className="inline w-4 h-4 mr-2" />
                Modération des avis
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'businesses' && (
        <div className="mb-8">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des entreprises</h2>
            </div>

            {/* Filtres et recherche */}
            <div className="mb-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      placeholder="Rechercher une entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Toutes</option>
                    <option value="verified">Vérifiées</option>
                    <option value="unverified">Non vérifiées</option>
                    <option value="premium">Premium</option>
                    <option value="inactive">Inactives</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Liste des entreprises */}
            {businessesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Chargement...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Entreprise
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Propriétaire
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {businesses.map((business) => (
                      <tr key={business.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {business.logo ? (
                              <img
                                src={getImageUrl(business.logo)}
                                alt={business.name}
                                className="object-cover w-10 h-10 rounded-lg"
                              />
                            ) : (
                              <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-lg">
                                <span className="text-sm font-semibold text-gray-500">
                                  {business.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{business.name}</div>
                                <div className="text-sm text-gray-500">{business.city}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{business.user?.name}</div>
                          <div className="text-sm text-gray-500">{business.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                            {business.is_verified ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Vérifiée
                              </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                                  <Clock className="w-3 h-3 mr-1" />
                                Non vérifiée
                              </span>
                            )}
                            {business.is_premium && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                            {formatUtils.date(business.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                            <div className="flex space-x-2">
                            {business.is_verified ? (
                              <button
                                onClick={() => handleUnverify(business.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                                  title="Désactiver la vérification"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(business.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Vérifier l'entreprise"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleTogglePremium(business.id, business.is_premium)}
                                className={`${
                                  business.is_premium 
                                    ? 'text-purple-600 hover:text-purple-900' 
                                    : 'text-gray-400 hover:text-gray-600'
                                }`}
                              title={business.is_premium ? 'Retirer le statut premium' : 'Ajouter le statut premium'}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
              </div>
            )}

        {/* Gestion des avis */}
        {activeTab === 'reviews' && (
          <div className="mb-8">
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Modération des avis</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {reviews.filter(r => r.status === 'pending').length} en attente
                  </span>
                </div>
                </div>
                
              {/* Filtres et recherche pour les avis */}
              <div className="mb-6">
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                      <input
                        type="text"
                        placeholder="Rechercher dans les avis..."
                        value={reviewSearchTerm}
                        onChange={(e) => setReviewSearchTerm(e.target.value)}
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <select
                      value={reviewStatusFilter}
                      onChange={(e) => setReviewStatusFilter(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvés</option>
                      <option value="rejected">Rejetés</option>
                      <option value="all">Tous</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Liste des avis */}
              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        Aucun avis trouvé
                      </h3>
                      <p className="text-gray-500">
                        Aucun avis ne correspond aux critères sélectionnés.
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-3 space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                                <span className="text-sm font-semibold text-blue-600">
                                  {review.user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{review.user?.name}</h4>
                                <p className="text-sm text-gray-500">
                                  Avis pour {review.business?.name}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {formatUtils.date(review.created_at)}
                                </p>
          </div>
        </div>

                            <div className="flex items-center mb-3 space-x-4">
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                              {getReviewStatusBadge(review.status)}
          </div>

                            {review.comment && (
                              <p className="mb-4 leading-relaxed text-gray-700">
                                {review.comment}
                              </p>
                            )}

                            {/* Actions de modération */}
                            {review.status === 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleModerateReview(review.id, 'approved')}
                                  disabled={moderateReviewMutation.isLoading}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 disabled:opacity-50"
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleModerateReview(review.id, 'rejected')}
                                  disabled={moderateReviewMutation.isLoading}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50"
                                >
                                  <ThumbsDown className="w-4 h-4 mr-1" />
                                  Rejeter
                                </button>
                              </div>
                            )}

                            {/* Actions pour les avis déjà modérés */}
                            {review.status !== 'pending' && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleModerateReview(review.id, 'approved')}
                                  disabled={moderateReviewMutation.isLoading}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 border border-green-200 rounded-md hover:bg-green-200 disabled:opacity-50"
                                >
                                  <ThumbsUp className="w-4 h-4 mr-1" />
                                  Approuver
                                </button>
                                <button
                                  onClick={() => handleModerateReview(review.id, 'rejected')}
                                  disabled={moderateReviewMutation.isLoading}
                                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50"
                                >
                                  <ThumbsDown className="w-4 h-4 mr-1" />
                                  Rejeter
                                </button>
                    </div>
                      )}
                    </div>
                  </div>
                      </div>
                    ))
                  )}
                </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

