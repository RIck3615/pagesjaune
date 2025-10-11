import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { businessService, categoryService } from '../services/api';
import SearchBar from '../components/Search/SearchBar';
import BusinessList from '../components/Business/BusinessList';
import { Filter, MapPin, Star, Clock, Grid, List, BadgeCheck } from 'lucide-react';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    premium: searchParams.get('premium') === 'true',
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  const query = searchParams.get('q') || '';

  // Fetch businesses based on search parameters avec optimisations
  const { data: businesses, isLoading, error, refetch } = useQuery(
    ['businesses', 'search', query, filters],
    async () => {
      const params = {
        search: query,
        category: filters.category,
        city: filters.location,
        rating: filters.rating,
        per_page: 20
      };
      
      // Ne pas envoyer verified si c'est undefined
      if (filters.verified !== undefined) {
        params.verified = filters.verified;
      }
      
      // Ne pas envoyer premium si c'est false
      if (filters.premium) {
        params.premium = filters.premium;
      }
      
      return businessService.getAll(params);
    },
    {
      select: (response) => response.data.data.data,
      enabled: true,
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false, // Éviter les refetch inutiles
    }
  );

  // Fetch categories for filter dropdown
  const { data: categories } = useQuery(
    ['categories', 'all'],
    () => categoryService.getAll({ root_only: false }),
    {
      select: (response) => response.data.data
    }
  );

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
  }, []);

  const handleSearch = (searchQuery, searchFilters = {}) => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (searchFilters.location) newParams.set('location', searchFilters.location);
    if (searchFilters.category) newParams.set('category', searchFilters.category);
    if (searchFilters.rating) newParams.set('rating', searchFilters.rating);
    if (searchFilters.premium) newParams.set('premium', 'true');
    if (searchFilters.verified) newParams.set('verified', 'true');
    
    setSearchParams(newParams);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      rating: '',
      premium: false,
    });
    setSearchParams({ q: query }); // Garder seulement la query
  };

  // Nouvelle fonction pour effacer complètement
  const handleClearAll = () => {
    setFilters({
      category: '',
      location: '',
      rating: '',
      premium: false,
    });
    setSearchParams({ q: '' }); // Effacer aussi la query
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">
            {query ? `Résultats pour "${query}"` : 'Rechercher des entreprises'}
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-4xl">
            <SearchBar
              onSearch={handleSearch}
              onClearAll={handleClearAll} // Nouvelle prop
              categories={categories || []}
              className="bg-white border-2 border-gray-300 focus-within:border-yellow-500"
              placeholder="Que recherchez-vous?"
              locationPlaceholder="Où recherchez-vous?"
              showClearAllButton={true} // Afficher le bouton "Effacer tout"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <div className="flex-shrink-0 lg:w-64">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtres
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Effacer les filtres
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Ville, province..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Note minimum
                  </label>
                  <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Toutes les notes</option>
                    <option value="4">4 étoiles et plus</option>
                    <option value="3">3 étoiles et plus</option>
                    <option value="2">2 étoiles et plus</option>
                    <option value="1">1 étoile et plus</option>
                  </select>
                </div>

                {/* Premium Filter */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.premium}
                      onChange={(e) => handleFilterChange('premium', e.target.checked)}
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Entreprises Premium uniquement
                    </span>
                  </label>
                </div>

                {/* Filtre Vérification */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-900">
                    <BadgeCheck className="w-4 h-4 mr-2" style={{ color: '#009ee5' }} />
                    Statut de vérification
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="verified"
                        checked={filters.verified === undefined}
                        onChange={() => handleFilterChange('verified', undefined)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Toutes les entreprises</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="verified"
                        checked={filters.verified === true}
                        onChange={() => handleFilterChange('verified', true)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Vérifiées uniquement
                        <span className="ml-1 text-xs text-gray-500">✓</span>
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="verified"
                        checked={filters.verified === false}
                        onChange={() => handleFilterChange('verified', false)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Non vérifiées uniquement</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Recherche en cours...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-red-600">
                  Erreur de recherche
                </h3>
                <p className="text-gray-600">
                  Impossible de charger les résultats. Veuillez réessayer.
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            ) : businesses?.length === 0 ? (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Aucun résultat trouvé
                </h3>
                <p className="mb-4 text-gray-600">
                  Essayez de modifier vos critères de recherche ou de parcourir les catégories.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-600">
                    {businesses?.length} entreprise{businesses?.length !== 1 ? 's' : ''} trouvée{businesses?.length !== 1 ? 's' : ''}
                  </p>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Affichage:</span>
                    <div className="flex border border-gray-300 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${viewMode === 'grid' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                        } rounded-l-lg transition-colors`}
                        title="Vue en grille"
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${viewMode === 'list' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                        } rounded-r-lg transition-colors`}
                        title="Vue en liste"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <BusinessList
                  businesses={businesses || []}
                  className={viewMode === 'grid' 
                    ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" 
                    : "space-y-4"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
