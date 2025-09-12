import React, { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ 
  onSearch, 
  categories = [], 
  className = '', 
  placeholder = "Que recherchez-vous?",
  locationPlaceholder = "Où recherchez-vous?"
}) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Suggestions basées sur les catégories populaires
  const popularSuggestions = [
    'Restaurants', 'Dentistes', 'Cliniques médicales', 'Réparation de voitures',
    'Épiceries', 'Avocats', 'Plombiers', 'Électriciens', 'Couvreurs', 'Garages'
  ];

  useEffect(() => {
    if (query.length > 1) {
      const filtered = popularSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      if (location.trim()) {
        searchParams.set('location', location.trim());
      }
      navigate(`/search?${searchParams.toString()}`);
      
      if (onSearch) {
        onSearch(query.trim(), { location: location.trim() });
      }
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
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

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        {/* Champ de recherche principal */}
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowSuggestions(query.length > 1)}
              placeholder={placeholder}
              className="w-full py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
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
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={locationPlaceholder}
              className="w-full py-3 pl-10 pr-4 text-lg border border-l-0 border-gray-300 sm:border-l sm:border-r-0 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>
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
    </div>
  );
};

export default SearchBar;
