import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { businessService, categoryService } from '../services/api'
import BusinessCard from '../components/BusinessCard'
import { Search, Filter, MapPin, Grid, List } from 'lucide-react'

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    city: searchParams.get('city') || '',
    category_id: searchParams.get('category') || '',
    province: searchParams.get('province') || '',
  })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch businesses with filters
  const { data: businessesData, isLoading, error } = useQuery(
    ['businesses', filters],
    () => businessService.getAll(filters),
    {
      keepPreviousData: true,
    }
  )

  // Fetch categories for filter
  const { data: categories } = useQuery(
    'categories',
    () => categoryService.getAll(),
    {
      select: (response) => response.data.data,
    }
  )

  const businesses = businessesData?.data?.data || []
  const pagination = businessesData?.data

  const handleSearch = (e) => {
    e.preventDefault()
    const newParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.append(key, value)
    })
    setSearchParams(newParams)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      city: '',
      category_id: '',
      province: '',
    })
    setSearchParams({})
  }

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Résultats de recherche
        </h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Que recherchez-vous ?"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ville"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="input pl-10"
              />
            </div>
            
            <select
              value={filters.category_id}
              onChange={(e) => handleFilterChange('category_id', e.target.value)}
              className="input"
            >
              <option value="">Toutes les catégories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <button type="submit" className="btn btn-primary">
              Rechercher
            </button>
          </div>
          
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filtres actifs:</span>
                {filters.search && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    Recherche: {filters.search}
                  </span>
                )}
                {filters.city && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    Ville: {filters.city}
                  </span>
                )}
                {filters.category_id && (
                  <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                    Catégorie: {categories?.find(c => c.id == filters.category_id)?.name}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Effacer tous les filtres
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">
            {pagination?.total || 0} résultat{(pagination?.total || 0) !== 1 ? 's' : ''} trouvé{(pagination?.total || 0) !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement des résultats</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && !error && (
        <>
          {businesses.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {businesses.map((business) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <Link
                  to={`?${new URLSearchParams({
                    ...filters,
                    page: pagination.current_page - 1
                  }).toString()}`}
                  className={`px-3 py-2 rounded-md text-sm ${
                    pagination.current_page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  Précédent
                </Link>
                
                {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                  <Link
                    key={page}
                    to={`?${new URLSearchParams({
                      ...filters,
                      page
                    }).toString()}`}
                    className={`px-3 py-2 rounded-md text-sm ${
                      page === pagination.current_page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border'
                    }`}
                  >
                    {page}
                  </Link>
                ))}
                
                <Link
                  to={`?${new URLSearchParams({
                    ...filters,
                    page: pagination.current_page + 1
                  }).toString()}`}
                  className={`px-3 py-2 rounded-md text-sm ${
                    pagination.current_page === pagination.last_page
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                  }`}
                >
                  Suivant
                </Link>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default SearchResults
