import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Filter, X } from 'lucide-react';
import { businessService } from '../../services/api';

const ProximitySearch = ({ onResults, onBusinessClick, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [results, setResults] = useState([]);

  // Obtenir la position de l'utilisateur
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par ce navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions de géolocalisation.');
        setIsLocating(false);
      }
    );
  };

  // Recherche par proximité
  const searchByProximity = async () => {
    if (!userLocation) {
      alert('Veuillez d\'abord autoriser la géolocalisation.');
      return;
    }

    setIsSearching(true);
    try {
      const response = await businessService.searchByProximity({
        search: searchTerm,
        location: location,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        radius: radius
      });

      setResults(response.data.data.data || []);
      onResults(response.data.data.data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      alert('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setIsSearching(false);
    }
  };

  // Navigation GPS vers une entreprise
  const navigateToBusiness = (business) => {
    if (!business.latitude || !business.longitude) {
      alert('Coordonnées GPS non disponibles pour cette entreprise.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
    window.open(url, '_blank');
  };

  // Calculer la distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Recherche par proximité
      </h3>

      {/* Formulaire de recherche */}
      <div className="space-y-4">
        {/* Terme de recherche */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Que recherchez-vous ?
          </label>
          <div className="relative">
            <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Restaurant, pharmacie, garage..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Localisation */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Où recherchez-vous ?
          </label>
          <div className="relative">
            <MapPin className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville, quartier..."
              className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Rayon de recherche */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Rayon de recherche: {radius} km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Position utilisateur */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
          <div>
            <p className="text-sm font-medium text-blue-900">Géolocalisation</p>
            <p className="text-xs text-blue-700">
              {userLocation ? 'Position détectée' : 'Position non détectée'}
            </p>
          </div>
          <button
            onClick={getUserLocation}
            disabled={isLocating}
            className="flex items-center px-3 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 mr-2 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Localisation...' : 'Ma position'}
          </button>
        </div>

        {/* Bouton de recherche */}
        <button
          onClick={searchByProximity}
          disabled={isSearching || !userLocation}
          className="flex items-center justify-center w-full px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4 mr-2" />
          {isSearching ? 'Recherche en cours...' : 'Rechercher à proximité'}
        </button>
      </div>

      {/* Résultats */}
      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 text-md">
              Résultats ({results.length})
            </h4>
            <button
              onClick={() => setResults([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-64">
            {results.map((business) => {
              const distance = userLocation ? 
                calculateDistance(
                  userLocation.lat, 
                  userLocation.lng, 
                  business.latitude, 
                  business.longitude
                ) : null;

              return (
                <div key={business.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-900 truncate">
                      {business.name}
                    </h5>
                    <p className="text-sm text-gray-600 truncate">
                      {business.address}
                    </p>
                    {business.phone && (
                      <p className="text-sm text-blue-600">
                        {business.phone}
                      </p>
                    )}
                    {distance && (
                      <p className="text-xs text-gray-500">
                        {distance.toFixed(1)} km
                      </p>
                    )}
                  </div>
                  <div className="flex ml-4 space-x-2">
                    <button
                      onClick={() => onBusinessClick(business)}
                      className="p-2 text-blue-600 rounded-lg hover:bg-blue-50"
                      title="Voir détails"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigateToBusiness(business)}
                      className="p-2 text-green-600 rounded-lg hover:bg-green-50"
                      title="Navigation GPS"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProximitySearch;