import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Filter, MapPin, Grid, List } from 'lucide-react';
import SearchBar from '../components/Search/SearchBar';
import BusinessList from '../components/Business/BusinessList';
import { businessService, categoryService } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  useEffect(() => {
    loadCategories();
    loadCities();
  }, []);

  useEffect(() => {
    if (query || categoryId) {
      performSearch();
    }
  }, [query, categoryId, searchParams]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll({ root_only: true });
      setCategories(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const loadCities = async () => {
    // Liste des principales villes de RDC
    const rdcCities = [
      'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani',
      'Bukavu', 'Goma', 'Matadi', 'Kikwit', 'Tshikapa', 'Kolwezi',
      'Likasi', 'Bunia', 'Uvira', 'Kalemie', 'Mbandaka', 'Kindu',
      'Isiro', 'Butembo', 'Beni', 'Gbadolite', 'Kamina', 'Mweka'
    ];
    setCities(rdcCities);
  };

  const performSearch = async (searchQuery = query, searchFilters = filters) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchQuery,
        category_id: categoryId || searchFilters.category_id,
        city: searchFilters.city,
        province: searchFilters.province,
        verified: searchFilters.verified,
        premium: searchFilters.premium,
        page: searchParams.get('page') || 1,
        per_page: 15,
      };

      // Supprimer les paramètres vides
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await businessService.getAll(params);
      setBusinesses(response.data.data.data);
      setPagination({
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page,
        per_page: response.data.data.per_page,
        total: response.data.data.total,
      });

    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery, searchFilters) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', searchQuery);
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
    setFilters(searchFilters);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);
    
    // Update URL with new filters
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        newParams.set(key, newFilters[key]);
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.delete('page'); // Reset to first page
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({});
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (categoryId) newParams.set('category', categoryId);
    setSearchParams(newParams);
  };

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de recherche */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            filters={filters}
            categories={categories}
            cities={cities}
            className="mb-6"
          />

          {/* Résumé de la recherche */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {query ? `Résultats pour "${query}"` : 'Toutes les entreprises'}
              </h1>
              {pagination.total && (
                <p className="text-gray-600">
                  {pagination.total} entreprise{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Filtres actifs et contrôles */}
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Effacer les filtres
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                
                let label = value;
                if (key === 'category_id') {
                  const category = categories.find(c => c.id == value);
                  label = category ? category.name : 'Catégorie';
                }
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {label}
                    <button
                      onClick={() => {
                        const newFilters = { ...filters, [key]: null };
                        handleFilterChange(newFilters);
                      }}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Résultats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtres latéraux */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
              
              {/* Filtre par catégorie */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) => handleFilterChange({ ...filters, category_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les catégories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par ville */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={filters.city || ''}
                  onChange={(e) => handleFilterChange({ ...filters, city: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtres avancés */}
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.verified || false}
                    onChange={(e) => handleFilterChange({ ...filters, verified: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Vérifiées uniquement</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.premium || false}
                    onChange={(e) => handleFilterChange({ ...filters, premium: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Premium uniquement</span>
                </label>
              </div>
            </div>
          </div>

          {/* Liste des résultats */}
          <div className="lg:col-span-3">
            <BusinessList
              businesses={businesses}
              loading={loading}
              error={error}
              className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}
            />

            {/* Pagination */}
            {pagination.last_page > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>
                  
                  {[...Array(pagination.last_page)].map((_, i) => {
                    const page = i + 1;
                    const isCurrentPage = page === pagination.current_page;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          isCurrentPage
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
