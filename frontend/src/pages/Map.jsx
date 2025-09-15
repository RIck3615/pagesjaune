import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Search, Filter, List, Grid } from 'lucide-react';
import MapView from '../components/Map/MapView';
import ProximitySearch from '../components/Map/ProximitySearch';
import BusinessList from '../components/Business/BusinessList';
import { businessService } from '../services/api';

const Map = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map'); // 'map' ou 'list'
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  // Charger les entreprises au montage du composant
  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const response = await businessService.getAll({
        verified: true,
        per_page: 100 // Charger plus d'entreprises pour la carte
      });
      
      const businessesData = response.data.data.data || [];
      setBusinesses(businessesData);
      setFilteredBusinesses(businessesData);
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessClick = (business) => {
    setSelectedBusiness(business);
    // Optionnel : rediriger vers la page de détails
    // navigate(`/business/${business.id}`);
  };

  const handleSearchResults = (results) => {
    setFilteredBusinesses(results);
  };

  const resetFilters = () => {
    setFilteredBusinesses(businesses);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-yellow-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Carte des entreprises
              </h1>
              <p className="text-gray-600">
                Découvrez les entreprises près de chez vous
              </p>
            </div>
            
            {/* Boutons de vue */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  viewMode === 'map' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Carte
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-lg ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <List className="w-4 h-4 mr-2" />
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Panneau de recherche */}
        <div className="overflow-y-auto bg-white border-r w-96">
          <div className="p-4">
            <ProximitySearch
              onResults={handleSearchResults}
              onBusinessClick={handleBusinessClick}
            />
            
            {/* Statistiques */}
            <div className="p-4 mt-6 rounded-lg bg-gray-50">
              <h4 className="mb-2 text-sm font-medium text-gray-900">
                Statistiques
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Total: {businesses.length} entreprises</p>
                <p>Affichées: {filteredBusinesses.length} entreprises</p>
                <p>Avec GPS: {businesses.filter(b => b.latitude && b.longitude).length} entreprises</p>
              </div>
            </div>

            {/* Bouton de réinitialisation */}
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 mt-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        {/* Zone principale */}
        <div className="flex flex-col flex-1">
          {viewMode === 'map' ? (
            <div className="flex-1">
              <MapView
                businesses={filteredBusinesses}
                onBusinessClick={handleBusinessClick}
                className="h-full"
                showUserLocation={true}
                showRadiusFilter={true}
                defaultCenter={[-4.4419, 15.2663]} // Kinshasa
                defaultZoom={11}
              />
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Liste des entreprises ({filteredBusinesses.length})
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Trier par:</span>
                  <select className="px-3 py-1 text-sm border border-gray-300 rounded-lg">
                    <option value="name">Nom</option>
                    <option value="distance">Distance</option>
                    <option value="rating">Note</option>
                  </select>
                </div>
              </div>
              
              <BusinessList
                businesses={filteredBusinesses}
                onBusinessClick={handleBusinessClick}
                className="grid grid-cols-1 gap-4"
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails d'entreprise */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 mx-4 bg-white rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedBusiness.name}
              </h3>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Adresse:</strong> {selectedBusiness.address}</p>
              {selectedBusiness.phone && (
                <p><strong>Téléphone:</strong> {selectedBusiness.phone}</p>
              )}
              {selectedBusiness.email && (
                <p><strong>Email:</strong> {selectedBusiness.email}</p>
              )}
              {selectedBusiness.website && (
                <p><strong>Site web:</strong> 
                  <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">
                    {selectedBusiness.website}
                  </a>
                </p>
              )}
            </div>
            
            <div className="flex mt-4 space-x-2">
              <button
                onClick={() => {
                  // Navigation GPS
                  if (selectedBusiness.latitude && selectedBusiness.longitude) {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBusiness.latitude},${selectedBusiness.longitude}`;
                    window.open(url, '_blank');
                  }
                }}
                className="flex items-center justify-center flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Navigation GPS
              </button>
              <button
                onClick={() => setSelectedBusiness(null)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
