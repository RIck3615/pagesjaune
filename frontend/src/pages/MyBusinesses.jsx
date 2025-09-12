import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  MapPin, 
  Phone,
  Building2,
  MoreVertical
} from 'lucide-react';
import { businessService } from '../services/api';
import { authUtils } from '../utils/auth';
import { formatUtils } from '../utils/format';

const MyBusinesses = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await businessService.getMyBusinesses();
      setBusinesses(response.data.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
      setError('Erreur lors du chargement de vos entreprises');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (businessId) => {
    if (!deleteConfirm || deleteConfirm !== businessId) {
      setDeleteConfirm(businessId);
      return;
    }

    try {
      await businessService.delete(businessId);
      setBusinesses(businesses.filter(b => b.id !== businessId));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'entreprise');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos entreprises...</p>
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
            onClick={loadBusinesses}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes entreprises</h1>
            <p className="text-gray-600 mt-2">
              Gérez vos fiches d'entreprise et suivez leurs performances
            </p>
          </div>
          
          <Link
            to="/business/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une entreprise
          </Link>
        </div>

        {/* Liste des entreprises */}
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* En-tête de la carte */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {business.logo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${business.logo}`}
                          alt={business.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 font-semibold text-lg">
                            {business.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {business.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {business.is_verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Vérifié
                            </span>
                          )}
                          {business.is_premium && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⭐ Premium
                            </span>
                          )}
                          {!business.is_active && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Inactif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu d'actions */}
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {formatUtils.truncate(business.description, 100)}
                  </p>

                  {/* Informations de contact */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="line-clamp-1">
                        {business.city}, {business.province}
                      </span>
                    </div>
                    
                    {business.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{formatUtils.phone(business.phone)}</span>
                      </div>
                    )}
                  </div>

                  {/* Note et avis */}
                  {business.reviews_count > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
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
                        {business.average_rating.toFixed(1)} ({business.reviews_count} avis)
                      </span>
                    </div>
                  )}

                  {/* Catégories */}
                  {business.categories && business.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {business.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {category.name}
                        </span>
                      ))}
                      {business.categories.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
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
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/business/${business.id}/edit`}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
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
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <span className="text-xs text-gray-500">
                      Créé le {formatUtils.date(business.created_at)}
                    </span>
                  </div>

                  {/* Confirmation de suppression */}
                  {deleteConfirm === business.id && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800 mb-2">
                        Êtes-vous sûr de vouloir supprimer cette entreprise ?
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(business.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
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
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune entreprise
            </h3>
            <p className="text-gray-600 mb-6">
              Commencez par ajouter votre première entreprise pour augmenter votre visibilité
            </p>
            <Link
              to="/business/new"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter ma première entreprise
            </Link>
          </div>
        )}

        {/* Statistiques */}
        {businesses.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  {businesses.reduce((acc, b) => acc + b.reviews_count, 0)}
                </div>
                <div className="text-sm text-gray-600">Avis total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBusinesses;

