import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  MessageCircle, 
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import { adminService } from '../../services/api';
import { formatUtils } from '../../utils/format';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { stats, recent_businesses, recent_reviews } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord administrateur
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez la plateforme PagesJaunes.cd
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_users}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Entreprises</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_businesses}</p>
                <p className="text-xs text-gray-500">
                  {stats.active_businesses} actives
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avis</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_reviews}</p>
                <p className="text-xs text-gray-500">
                  {stats.pending_reviews} en attente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-purple-600" />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entreprises récentes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Entreprises récentes</h2>
              <a
                href="/admin/businesses"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir toutes
              </a>
            </div>

            <div className="space-y-4">
              {recent_businesses.map((business) => (
                <div key={business.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {business.logo ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${business.logo}`}
                        alt={business.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 font-semibold text-sm">
                          {business.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{business.name}</h3>
                      <p className="text-sm text-gray-600">{business.city}, {business.province}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {business.is_verified && (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        )}
                        {business.is_premium && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                        {!business.is_active && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatUtils.relativeDate(business.created_at)}
                    </p>
                    <p className="text-xs text-gray-400">
                      par {business.user?.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avis récents */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Avis récents</h2>
              <a
                href="/admin/reviews"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir tous
              </a>
            </div>

            <div className="space-y-4">
              {recent_reviews.map((review) => (
                <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {review.user?.name || 'Utilisateur anonyme'}
                      </span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {review.status === 'pending' && (
                        <Clock className="h-3 w-3 text-yellow-500" />
                      )}
                      {review.status === 'approved' && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      {review.status === 'rejected' && (
                        <XCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {review.business?.name}
                  </p>
                  
                  {review.comment && (
                    <p className="text-gray-700 text-sm line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    {formatUtils.relativeDate(review.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-shadow"
            >
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Gérer les utilisateurs</h3>
                <p className="text-sm text-gray-600">Voir et modifier les comptes</p>
              </div>
            </a>
            
            <a
              href="/admin/businesses"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-shadow"
            >
              <Building2 className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Gérer les entreprises</h3>
                <p className="text-sm text-gray-600">Modérer et vérifier</p>
              </div>
            </a>
            
            <a
              href="/admin/reviews"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:shadow-md transition-shadow"
            >
              <MessageCircle className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Modérer les avis</h3>
                <p className="text-sm text-gray-600">Approuver ou rejeter</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

