import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  MessageCircle, 
  Plus, 
  Edit, 
  Eye,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react';
import { businessService, reviewService } from '../services/api';
import { authUtils } from '../utils/auth';
import { formatUtils } from '../utils/format';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    totalReviews: 0,
    averageRating: 0,
    totalViews: 0,
  });

  const user = authUtils.getUser();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (user?.role === 'business') {
        // Charger les entreprises de l'utilisateur
        const businessesResponse = await businessService.getMyBusinesses();
        setBusinesses(businessesResponse.data.data.data);

        // Charger les avis reçus
        const reviewsResponse = await reviewService.getMyReviews();
        setReviews(reviewsResponse.data.data.data);

        // Calculer les statistiques
        const businessesData = businessesResponse.data.data.data;
        const reviewsData = reviewsResponse.data.data.data;

        setStats({
          totalBusinesses: businessesData.length,
          totalReviews: reviewsData.length,
          averageRating: businessesData.reduce((acc, business) => acc + business.average_rating, 0) / businessesData.length || 0,
          totalViews: 0, // À implémenter si nécessaire
        });
      }

    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
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

  return (
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
                  <Building2 className="w-8 h-8 text-blue-600" />
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

            {/* Actions rapides */}
            <div className="p-6 mb-8 bg-white rounded-lg shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions rapides</h2>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/my-businesses"
                  className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Gérer mes entreprises
                </Link>
                <Link
                  to="/business/new"
                  className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une entreprise
                </Link>
                <Link
                  to="/premium"
                  className="inline-flex items-center px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Passer en Premium
                </Link>
              </div>
            </div>

            {/* Mes entreprises récentes */}
            <div className="p-6 mb-8 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Mes entreprises</h2>
                <Link
                  to="/my-businesses"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Voir toutes
                </Link>
              </div>

              {businesses.length > 0 ? (
                <div className="space-y-4">
                  {businesses.slice(0, 3).map((business) => (
                    <div key={business.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {business.logo ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${business.logo}`}
                            alt={business.name}
                            className="object-cover w-12 h-12 rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
                            <span className="font-semibold text-gray-500">
                              {business.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium text-gray-900">{business.name}</h3>
                          <p className="text-sm text-gray-600">{business.city}, {business.province}</p>
                          <div className="flex items-center mt-1 space-x-2">
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
                  <Link
                    to="/business/new"
                    className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter une entreprise
                  </Link>
                </div>
              )}
            </div>

            {/* Avis récents */}
            <div className="p-6 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Avis récents</h2>
                <Link
                  to="/my-reviews"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Voir tous
                </Link>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {review.business?.name}
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
                        <span className="text-sm text-gray-500">
                          {formatUtils.relativeDate(review.created_at)}
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
                className="p-6 transition-shadow border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md"
              >
                <Building2 className="w-8 h-8 mb-4 text-blue-600" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Rechercher des entreprises
                </h3>
                <p className="text-gray-600">
                  Trouvez facilement les services dont vous avez besoin
                </p>
              </Link>
              
              <Link
                to="/categories"
                className="p-6 transition-shadow border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md"
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
  );
};

export default Dashboard;