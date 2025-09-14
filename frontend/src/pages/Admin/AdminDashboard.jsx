import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { adminService } from '../../services/api';
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
  Search
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
    ['admin-businesses', currentPage, searchTerm, statusFilter],
    () => adminService.getBusinesses({
      page: currentPage,
      search: searchTerm,
      status: statusFilter,
      per_page: 10
    }),
    {
      select: (response) => response.data.data,
      enabled: true
    }
  );

  // Verify business mutation
  const verifyBusinessMutation = useMutation(
    (businessId) => adminService.updateBusiness(businessId, { is_verified: true }),
    {
      onSuccess: () => {
        toast.success('Entreprise vérifiée avec succès');
        queryClient.invalidateQueries(['admin-businesses']);
      },
      onError: (error) => {
        toast.error('Erreur lors de la vérification');
        console.error('Erreur:', error);
      }
    }
  );

  // Unverify business mutation
  const unverifyBusinessMutation = useMutation(
    (businessId) => adminService.updateBusiness(businessId, { is_verified: false }),
    {
      onSuccess: () => {
        toast.success('Entreprise non vérifiée');
        queryClient.invalidateQueries(['admin-businesses']);
      },
      onError: (error) => {
        toast.error('Erreur lors de la modification');
        console.error('Erreur:', error);
      }
    }
  );

  // Toggle premium mutation
  const togglePremiumMutation = useMutation(
    ({ businessId, isPremium }) => adminService.updateBusiness(businessId, { is_premium: isPremium }),
    {
      onSuccess: () => {
        toast.success('Statut premium modifié');
        queryClient.invalidateQueries(['admin-businesses']);
      },
      onError: (error) => {
        toast.error('Erreur lors de la modification');
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
  const businesses = businessesData?.data || [];
  const pagination = businessesData?.meta || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez la plateforme PagesJaunes.cd
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entreprises</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_businesses}</p>
                <p className="text-xs text-gray-500">
                  {stats.active_businesses} actives
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <MessageCircle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avis</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_reviews}</p>
                <p className="text-xs text-gray-500">
                  {stats.pending_reviews} en attente
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.premium_businesses}</p>
                <p className="text-xs text-gray-500">
                  entreprises premium
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gestion des entreprises */}
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
                              <div className="text-sm font-medium text-gray-900">
                                {business.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {business.city}, {business.province}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{business.user?.name}</div>
                          <div className="text-sm text-gray-500">{business.user?.email}</div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {business.is_verified ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Vérifiée
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Non vérifiée
                              </span>
                            )}
                            
                            {business.is_premium && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Premium
                              </span>
                            )}
                            
                            {!business.is_active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {formatUtils.relativeDate(business.created_at)}
                        </td>
                        
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/business/${business.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir l'entreprise"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {business.is_verified ? (
                              <button
                                onClick={() => handleUnverify(business.id)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Décocher la vérification"
                                disabled={unverifyBusinessMutation.isLoading}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerify(business.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Vérifier l'entreprise"
                                disabled={verifyBusinessMutation.isLoading}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleTogglePremium(business.id, business.is_premium)}
                              className={`${business.is_premium ? 'text-yellow-600 hover:text-yellow-900' : 'text-gray-400 hover:text-yellow-600'}`}
                              title={business.is_premium ? 'Retirer le statut premium' : 'Ajouter le statut premium'}
                              disabled={togglePremiumMutation.isLoading}
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

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border-t border-gray-200 sm:px-6">
                <div className="flex justify-between flex-1 sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                    disabled={currentPage === pagination.last_page}
                    className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">{pagination.from}</span> à{' '}
                      <span className="font-medium">{pagination.to}</span> sur{' '}
                      <span className="font-medium">{pagination.total}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Précédent
                      </button>
                      
                      {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))}
                        disabled={currentPage === pagination.last_page}
                        className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Suivant
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Avis récents - Section corrigée */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Avis récents</h2>
          </div>

          <div className="space-y-4">
            {recent_businesses && recent_businesses.length > 0 ? (
              recent_businesses.map((business) => (
                <div key={business.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {business.name}
                      </span>
                      <div className="flex items-center">
                        {business.is_verified && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {business.is_premium && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {business.is_active ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <p className="mb-2 text-sm text-gray-600">
                    {business.city}, {business.province}
                  </p>
                  
                  {business.description && (
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {business.description}
                    </p>
                  )}
                  
                  <p className="mt-2 text-xs text-gray-500">
                    {formatUtils.relativeDate(business.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-500">
                Aucune entreprise récente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

