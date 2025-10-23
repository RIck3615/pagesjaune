import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, Loader2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { businessService } from '../../services/api';

const SearchBar = ({ 
  onSearch, 
  onClearAll,
  categories = [], 
  className = '', 
  placeholder = "Que recherchez-vous?",
  locationPlaceholder = "Où recherchez-vous?",
  showClearAllButton = false
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Suggestions basées sur les catégories populaires (fallback)
  const popularSuggestions = [
    'Restaurants', 'Dentistes', 'Cliniques médicales', 'Réparation de voitures',
    'Épiceries', 'Avocats', 'Plombiers', 'Électriciens', 'Couvreurs', 'Garages'
  ];

  // Charger les recherches récentes depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // S'assurer que toutes les recherches sont des chaînes
        const stringSearches = parsed
          .filter(search => search && typeof search === 'string')
          .map(search => String(search).trim())
          .filter(search => search.length > 0);
        setRecentSearches(stringSearches);
      } catch (error) {
        console.error('Erreur lors du parsing des recherches récentes:', error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Requête pour les suggestions de recherche avec debounce
  const { data: searchSuggestions, isLoading: isLoadingSearch } = useQuery(
    ['autocomplete', 'search', query],
    () => businessService.autocomplete(query),
    {
      enabled: query.length > 1 && !hasSearched,
      select: (response) => {
        const data = response?.data?.data;
        // S'assurer que les données sont un tableau de chaînes
        if (Array.isArray(data)) {
          return data
            .filter(item => item && typeof item === 'string')
            .map(item => String(item).trim())
            .filter(item => item.length > 0);
        }
        return [];
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Gérer les suggestions combinées
  useEffect(() => {
    if (query.length > 1 && !hasSearched) {
      const allSuggestions = [];
      
      // Ajouter les suggestions de l'API
      if (searchSuggestions && Array.isArray(searchSuggestions)) {
        allSuggestions.push(...searchSuggestions);
      }
      
      // Ajouter les suggestions populaires qui correspondent
      const matchingPopular = popularSuggestions.filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      allSuggestions.push(...matchingPopular);
      
      // Dédupliquer et limiter - s'assurer que tout est des chaînes
      const uniqueSuggestions = [...new Set(allSuggestions)]
        .filter(item => item && typeof item === 'string')
        .map(item => String(item).trim())
        .filter(item => item.length > 0)
        .slice(0, 8);
      
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(uniqueSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, searchSuggestions, hasSearched]);

  // Gérer les suggestions de localisation
  useEffect(() => {
    if (location.length > 1) {
      const popularCities = [
        'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani',
        'Bukavu', 'Goma', 'Matadi', 'Kikwit', 'Tshikapa'
      ];
      
      const matchingCities = popularCities.filter(city => 
        city.toLowerCase().includes(location.toLowerCase())
      );
      
      setShowLocationSuggestions(matchingCities.length > 0);
    } else {
      setShowLocationSuggestions(false);
    }
  }, [location]);

  // Fonction de recherche
  const handleSearch = useCallback((searchQuery, searchLocation) => {
    const searchData = {
      term: searchQuery || query,
      location: searchLocation || location,
      category: null
    };

    // Sauvegarder la recherche récente
    if (searchData.term) {
      try {
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const cleanSearches = searches
          .filter(s => s && typeof s === 'string')
          .map(s => String(s).trim())
          .filter(s => s.length > 0);
        const newSearches = [String(searchData.term).trim(), ...cleanSearches.filter(s => s !== String(searchData.term).trim())].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des recherches récentes:', error);
      }
    }

    // Appeler la fonction onSearch avec les données formatées
    if (onSearch) {
      onSearch(searchData);
    }

    // Navigation vers la page de recherche
    const params = new URLSearchParams();
    if (searchData.term) params.append('q', String(searchData.term));
    if (searchData.location) params.append('location', String(searchData.location));
    
    navigate(`/search?${params.toString()}`);
    
    // Fermer les suggestions
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
    setShowRecentSearches(false);
    setHasSearched(true);
    setHasAttemptedSubmit(false);
  }, [query, location, onSearch, navigate]);

  // Gestion de la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (query.trim()) {
      handleSearch(query, location);
    } else {
      setShowEmptyState(true);
    }
  };

  // Gestion des clics sur les suggestions
  const handleSuggestionClick = (suggestion) => {
    const cleanSuggestion = String(suggestion).trim();
    setQuery(cleanSuggestion);
    setHasSearched(false);
    handleSearch(cleanSuggestion, location);
  };

  // Gestion des clics sur les suggestions de localisation
  const handleLocationSuggestionClick = (city) => {
    setLocation(city);
    setShowLocationSuggestions(false);
    handleSearch(query, city);
  };

  // Gestion des touches clavier
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setShowLocationSuggestions(false);
      setShowRecentSearches(false);
    }
  };

  // Gestion des touches clavier pour la localisation
  const handleLocationKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedLocationIndex(prev => prev + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedLocationIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      setShowLocationSuggestions(false);
      setShowRecentSearches(false);
    }
  };

  // Effacer la recherche
  const clearSearch = () => {
    setQuery('');
    setLocation('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
    setShowRecentSearches(false);
    setHasSearched(false);
    setShowEmptyState(false);
    setHasAttemptedSubmit(false);
    setSelectedSuggestionIndex(-1);
    setSelectedLocationIndex(-1);
    searchInputRef.current?.focus();
  };

  // Effacer tout
  const clearAll = () => {
    clearSearch();
    if (onClearAll) {
      onClearAll();
    }
  };

  // Gérer les changements d'input
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setHasSearched(false);
    setShowEmptyState(false);
    setHasAttemptedSubmit(false);
    setSelectedSuggestionIndex(-1);
    
    if (value.length > 1) {
      setShowSuggestions(true);
      setShowRecentSearches(false);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setLocation(value);
    setSelectedLocationIndex(-1);
    
    if (value.length > 1) {
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  // Gérer le focus sur le champ de recherche
  const handleSearchFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    } else if (recentSearches.length > 0 && !query) {
      setShowRecentSearches(true);
    }
  };

  // Gérer le blur sur le champ de recherche
  const handleSearchBlur = () => {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
      setShowSuggestions(false);
      setShowRecentSearches(false);
    }, 200);
  };

  // Gérer le focus sur le champ de localisation
  const handleLocationFocus = () => {
    if (location.length > 1) {
      setShowLocationSuggestions(true);
    }
  };

  // Gérer le blur sur le champ de localisation
  const handleLocationBlur = () => {
    setTimeout(() => setShowLocationSuggestions(false), 200);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex flex-col gap-2 sm:flex-row">
          {/* Champ de recherche principal */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                placeholder={placeholder}
                className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:py-3 sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setShowSuggestions(false);
                    setShowRecentSearches(false);
                    searchInputRef.current?.focus();
                  }}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions de recherche */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${
                      index === selectedSuggestionIndex ? 'bg-gray-50' : ''
                    } ${index === 0 ? 'rounded-t-lg' : ''} ${
                      index === suggestions.length - 1 ? 'rounded-b-lg' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Search className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-gray-900">{String(suggestion)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Champ de localisation */}
          <div className="relative flex-1">
            <div className="relative">
              <MapPin className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={handleLocationChange}
                onKeyDown={handleLocationKeyDown}
                onFocus={handleLocationFocus}
                onBlur={handleLocationBlur}
                placeholder={locationPlaceholder}
                className="w-full py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:py-3 sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation('');
                    setShowLocationSuggestions(false);
                    locationInputRef.current?.focus();
                  }}
                  className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Suggestions de localisation */}
            {showLocationSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {['Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani', 'Bukavu', 'Goma', 'Matadi', 'Kikwit', 'Tshikapa']
                  .filter(city => city.toLowerCase().includes(location.toLowerCase()))
                  .map((city, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleLocationSuggestionClick(city)}
                      className="w-full px-4 py-2 text-left rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-gray-900">{city}</span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Bouton de recherche */}
          <button
            type="submit"
            className="px-4 py-3 text-sm font-medium text-white transition-colors bg-yellow-500 rounded-lg sm:px-6 sm:text-base hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            {isLoadingSearch ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Rechercher'
            )}
          </button>
        </div>

        {/* Message d'erreur si recherche vide */}
        {hasAttemptedSubmit && !query.trim() && (
          <div className="flex items-center mt-2 text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" />
            <span className="text-sm">Veuillez saisir un terme de recherche</span>
          </div>
        )}

        {/* Bouton Effacer tout */}
        {showClearAllButton && (query || location) && (
          <div className="mt-2">
            <button
              type="button"
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Effacer tout
            </button>
          </div>
        )}
      </form>

      {/* Recherches récentes */}
      {showRecentSearches && !showSuggestions && !hasSearched && recentSearches.length > 0 && (
        <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Recherches récentes</span>
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {recentSearches.slice(0, 5).map((search, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(search)}
                className="w-full px-4 py-2 text-left border-b border-gray-100 hover:bg-gray-50 last:border-b-0"
              >
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-900">{String(search)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
