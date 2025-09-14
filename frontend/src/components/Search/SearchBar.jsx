import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, X, Loader2, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { autocompleteService } from '../../services/api';

const SearchBar = ({ 
  onSearch, 
  onClearAll, // Nouvelle prop pour gérer l'effacement complet
  categories = [], 
  className = '', 
  placeholder = "Que recherchez-vous?",
  locationPlaceholder = "Où recherchez-vous?",
  showClearAllButton = false // Nouvelle prop pour afficher le bouton "Effacer tout"
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
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
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Requête pour les suggestions de recherche avec debounce
  const { data: searchSuggestions, isLoading: isLoadingSearch } = useQuery(
    ['autocomplete', 'search', query],
    () => autocompleteService.getSuggestions(query, 'business'),
    {
      enabled: query.length > 1 && !hasSearched,
      select: (response) => response.data.data,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Requête pour les suggestions de catégories
  const { data: categorySuggestions, isLoading: isLoadingCategory } = useQuery(
    ['autocomplete', 'category', query],
    () => autocompleteService.getSuggestions(query, 'category'),
    {
      enabled: query.length > 1 && !hasSearched,
      select: (response) => response.data.data,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Requête pour les suggestions de localisation
  const { data: locationSuggestions, isLoading: isLoadingLocation } = useQuery(
    ['autocomplete', 'location', location],
    () => autocompleteService.getSuggestions(location, 'location'),
    {
      enabled: location.length > 1,
      select: (response) => response.data.data,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  // Gérer les suggestions de recherche
  useEffect(() => {
    // Ne pas afficher de suggestions si une recherche a été effectuée
    if (hasSearched) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (query.length > 1) {
      const allSuggestions = [
        ...(searchSuggestions || []),
        ...(categorySuggestions || [])
      ];
      
      // Si pas de suggestions de l'API, utiliser les suggestions populaires
      if (allSuggestions.length === 0) {
        const filtered = popularSuggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
      } else {
        setSuggestions(allSuggestions.slice(0, 8));
      }
      setShowSuggestions(true);
    } else if (query.length === 0) {
      // Afficher les recherches récentes quand le champ est vide
      setSuggestions(recentSearches.slice(0, 5));
      setShowSuggestions(recentSearches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [query, searchSuggestions, categorySuggestions, recentSearches, hasSearched]);

  // Gérer les suggestions de localisation
  useEffect(() => {
    if (location.length > 1 && locationSuggestions) {
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
    setSelectedLocationIndex(-1);
  }, [location, locationSuggestions]);

  const saveRecentSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(item => item !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marquer qu'une tentative de soumission a été faite
    setHasAttemptedSubmit(true);
    
    // Validation des champs vides - seulement au moment de la soumission
    if (!query.trim() && !location.trim()) {
      setShowEmptyState(true);
      // Focus sur le champ de recherche
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
      return;
    }
    
    if (query.trim()) {
      setHasSearched(true);
      setShowEmptyState(false);
      saveRecentSearch(query.trim());
      
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (location.trim()) {
        searchParams.set('location', location.trim());
      }
      navigate(`/search?${searchParams.toString()}`);
      
      if (onSearch) {
        onSearch(query.trim(), { location: location.trim() });
      }
      setShowSuggestions(false);
      setShowLocationSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setHasSearched(true);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    setShowEmptyState(false);
    setHasAttemptedSubmit(false);
    saveRecentSearch(suggestion);
    
    const searchParams = new URLSearchParams();
    searchParams.set('q', suggestion);
    if (location.trim()) {
      searchParams.set('location', location.trim());
    }
    navigate(`/search?${searchParams.toString()}`);
    
    if (onSearch) {
      onSearch(suggestion, { location: location.trim() });
    }
  };

  const handleLocationSuggestionClick = (suggestion) => {
    setLocation(suggestion.display || suggestion);
    setShowLocationSuggestions(false);
    setSelectedLocationIndex(-1);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Fonction pour effacer tout
  const handleClearAll = () => {
    setQuery('');
    setLocation('');
    setHasSearched(false);
    setShowEmptyState(false);
    setHasAttemptedSubmit(false);
    setShowSuggestions(false);
    setShowLocationSuggestions(false);
    
    // Naviguer vers la page de recherche vide
    navigate('/search?q=');
    
    // Appeler la fonction de callback si fournie
    if (onClearAll) {
      onClearAll();
    }
  };

  // Réinitialiser l'état de recherche quand l'utilisateur commence à taper
  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Si l'utilisateur efface complètement le champ, réinitialiser l'état de recherche
    if (newQuery.length === 0) {
      setHasSearched(false);
    }
    
    // Masquer l'erreur quand l'utilisateur commence à taper
    if (newQuery.length > 0) {
      setShowEmptyState(false);
    }
  };

  const handleLocationChange = (e) => {
    const newLocation = e.target.value;
    setLocation(newLocation);
    
    // Masquer l'erreur quand l'utilisateur commence à taper
    if (newLocation.length > 0) {
      setShowEmptyState(false);
    }
  };

  const handleKeyDown = (e, type) => {
    if (type === 'search') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        setShowEmptyState(false);
      }
    } else if (type === 'location') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedLocationIndex(prev => 
          prev < (locationSuggestions?.length || 0) - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedLocationIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedLocationIndex >= 0) {
        e.preventDefault();
        handleLocationSuggestionClick(locationSuggestions[selectedLocationIndex]);
      } else if (e.key === 'Escape') {
        setShowLocationSuggestions(false);
        setSelectedLocationIndex(-1);
      }
    }
  };

  const handleInputFocus = (type) => {
    if (type === 'search') {
      // Ne pas afficher les suggestions si une recherche a été effectuée
      if (hasSearched) return;
      
      if (query.length > 1) {
        setShowSuggestions(true);
      } else if (recentSearches.length > 0) {
        setSuggestions(recentSearches.slice(0, 5));
        setShowSuggestions(true);
      } else {
        // Afficher les suggestions populaires si pas de recherches récentes
        setSuggestions(popularSuggestions.slice(0, 5));
        setShowSuggestions(true);
      }
    } else if (type === 'location' && location.length > 1) {
      setShowLocationSuggestions(true);
    }
  };

  const handleInputBlur = (type) => {
    // Délai pour permettre le clic sur les suggestions
    setTimeout(() => {
      if (type === 'search') {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      } else if (type === 'location') {
        setShowLocationSuggestions(false);
        setSelectedLocationIndex(-1);
      }
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        {/* Champ de recherche principal */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => handleInputFocus('search')}
              onBlur={() => handleInputBlur('search')}
              onKeyDown={(e) => handleKeyDown(e, 'search')}
              placeholder={placeholder}
              className={`w-full py-3 pl-10 pr-4 text-lg border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                showEmptyState && hasAttemptedSubmit ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {(isLoadingSearch || isLoadingCategory) && !hasSearched && (
              <Loader2 className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-10 top-1/2 animate-spin" />
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setHasSearched(false);
                  setShowEmptyState(false);
                  setHasAttemptedSubmit(false);
                }}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Message d'erreur pour les champs vides - seulement après tentative de soumission */}
          {showEmptyState && hasAttemptedSubmit && !query.trim() && !location.trim() && (
            <div className="absolute z-10 w-full p-3 mt-1 border border-red-200 rounded-lg shadow-lg bg-red-50">
              <div className="flex items-center text-red-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span className="text-sm">Veuillez saisir au moins un terme de recherche ou une localisation</span>
              </div>
            </div>
          )}
          
          {/* Suggestions de recherche - Ne s'affichent que si pas de recherche effectuée */}
          {showSuggestions && suggestions.length > 0 && !hasSearched && !showEmptyState && (
            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
              {/* En-tête pour les recherches récentes */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500 border-b bg-gray-50">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recherches récentes
                  </div>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Effacer
                  </button>
                </div>
              )}
              
              {/* En-tête pour les suggestions */}
              {query.length > 0 && (
                <div className="flex items-center px-4 py-2 text-sm text-gray-500 border-b bg-gray-50">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Suggestions
                </div>
              )}
              
              {/* En-tête pour les suggestions populaires */}
              {query.length === 0 && recentSearches.length === 0 && (
                <div className="flex items-center px-4 py-2 text-sm text-gray-500 border-b bg-gray-50">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Suggestions populaires
                </div>
              )}
              
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    index === selectedSuggestionIndex ? 'bg-yellow-50 text-yellow-700' : ''
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Champ de localisation */}
        <div className="relative sm:w-64">
          <div className="relative">
            <MapPin className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={handleLocationChange}
              onFocus={() => handleInputFocus('location')}
              onBlur={() => handleInputBlur('location')}
              onKeyDown={(e) => handleKeyDown(e, 'location')}
              placeholder={locationPlaceholder}
              className={`w-full py-3 pl-10 pr-4 text-lg border border-l-0 border-gray-300 sm:border-l sm:border-r-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                showEmptyState && hasAttemptedSubmit ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            {isLoadingLocation && (
              <Loader2 className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 right-10 top-1/2 animate-spin" />
            )}
          </div>

          {/* Suggestions de localisation */}
          {showLocationSuggestions && locationSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60">
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSuggestionClick(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                    index === selectedLocationIndex ? 'bg-yellow-50 text-yellow-700' : ''
                  }`}
                >
                  {suggestion.display || suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bouton de recherche */}
        <button
          type="submit"
          className="flex items-center justify-center px-8 py-3 font-medium text-white transition-colors bg-yellow-500 rounded-l-lg rounded-r-lg hover:bg-yellow-600 sm:rounded-l-none sm:rounded-r-lg"
        >
          <Search className="w-5 h-5 mr-2" />
          Rechercher
        </button>
      </form>

      {/* Bouton "Effacer tout" - affiché seulement si showClearAllButton est true */}
      {showClearAllButton && (query.trim() || location.trim()) && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <X className="w-4 h-4 mr-2" />
            Effacer tout
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
