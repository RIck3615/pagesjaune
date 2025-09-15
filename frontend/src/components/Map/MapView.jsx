import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { MapPin, Navigation, Layers, Search, Filter, X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icônes personnalisées
const businessIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userLocationIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
      <circle cx="12.5" cy="12.5" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Composant pour centrer la carte sur la position utilisateur
function CenterMapOnUser({ userLocation, setUserLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation, map]);

  return null;
}

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Composant pour les marqueurs d'entreprises
function BusinessMarkers({ businesses, onBusinessClick, userLocation, radius }) {
  return (
    <>
      {businesses.map((business) => {
        if (!business.latitude || !business.longitude) return null;

        const distance = userLocation ? 
          calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            business.latitude, 
            business.longitude
          ) : null;

        // Filtrer par rayon si spécifié
        if (radius && distance && distance > radius) return null;

        return (
          <Marker
            key={business.id}
            position={[business.latitude, business.longitude]}
            icon={businessIcon}
            eventHandlers={{
              click: () => onBusinessClick(business)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="mb-2 font-semibold text-gray-900">{business.name}</h3>
                <p className="mb-2 text-sm text-gray-600">{business.address}</p>
                {business.phone && (
                  <p className="mb-1 text-sm text-blue-600">{business.phone}</p>
                )}
                {distance && (
                  <p className="text-xs text-gray-500">
                    {distance.toFixed(1)} km
                  </p>
                )}
                <button
                  onClick={() => onBusinessClick(business)}
                  className="px-3 py-1 mt-2 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

// Fonction utilitaire pour calculer la distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const MapView = ({ 
  businesses = [], 
  onBusinessClick, 
  className = "",
  showUserLocation = true,
  showRadiusFilter = true,
  defaultCenter = [-4.4419, 15.2663], // Kinshasa par défaut
  defaultZoom = 11
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [radius, setRadius] = useState(10); // Rayon par défaut en km
  const [mapType, setMapType] = useState('osm'); // 'osm' ou 'satellite'
  const [isLocating, setIsLocating] = useState(false);
  const [filteredBusinesses, setFilteredBusinesses] = useState(businesses);

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
        const newLocation = { lat: latitude, lng: longitude };
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        setMapZoom(13);
        setIsLocating(false);
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez les permissions de géolocalisation.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  // Filtrer les entreprises par rayon
  useEffect(() => {
    if (!userLocation || !showRadiusFilter) {
      setFilteredBusinesses(businesses);
      return;
    }

    const filtered = businesses.filter(business => {
      if (!business.latitude || !business.longitude) return false;
      
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        business.latitude,
        business.longitude
      );
      
      return distance <= radius;
    });

    setFilteredBusinesses(filtered);
  }, [businesses, userLocation, radius, showRadiusFilter]);

  // Navigation GPS vers une entreprise
  const navigateToBusiness = (business) => {
    if (!business.latitude || !business.longitude) {
      alert('Coordonnées GPS non disponibles pour cette entreprise.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
    window.open(url, '_blank');
  };

  // Changer le type de carte
  const getTileLayer = () => {
    switch (mapType) {
      case 'satellite':
        return (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
        );
      case 'osm':
      default:
        return (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Contrôles de la carte */}
      <div className="absolute top-4 left-4 z-[1000] space-y-2">
        {/* Bouton de géolocalisation */}
        {showUserLocation && (
          <button
            onClick={getUserLocation}
            disabled={isLocating}
            className="flex items-center px-3 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 disabled:opacity-50"
            title="Ma position"
          >
            <Navigation className={`w-4 h-4 mr-2 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? 'Localisation...' : 'Ma position'}
          </button>
        )}

        {/* Sélecteur de type de carte */}
        <div className="flex overflow-hidden bg-white rounded-lg shadow-md">
          <button
            onClick={() => setMapType('osm')}
            className={`px-3 py-2 text-sm ${mapType === 'osm' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Plan
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-2 text-sm ${mapType === 'satellite' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          >
            Satellite
          </button>
        </div>

        {/* Filtre par rayon */}
        {showRadiusFilter && userLocation && (
          <div className="bg-white rounded-lg shadow-md p-3 min-w-[200px]">
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
            <p className="mt-2 text-xs text-gray-600">
              {filteredBusinesses.length} entreprise(s) trouvée(s)
            </p>
          </div>
        )}
      </div>

      {/* Informations de position utilisateur */}
      {userLocation && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-md p-3">
          <h4 className="mb-1 text-sm font-medium text-gray-900">Votre position</h4>
          <p className="text-xs text-gray-600">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </div>
      )}

      {/* Carte */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="w-full h-full"
        style={{ height: '500px', width: '100%' }}
      >
        {getTileLayer()}
        
        <CenterMapOnUser userLocation={userLocation} setUserLocation={setUserLocation} />
        
        <MapClickHandler onMapClick={(latlng) => {
          console.log('Clic sur la carte:', latlng);
        }} />

        {/* Marqueur de position utilisateur */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold">Votre position</h4>
                <p className="text-sm text-gray-600">
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marqueurs des entreprises */}
        <BusinessMarkers
          businesses={filteredBusinesses}
          onBusinessClick={onBusinessClick}
          userLocation={userLocation}
          radius={showRadiusFilter ? radius : null}
        />
      </MapContainer>

      {/* Liste des entreprises avec navigation GPS */}
      {filteredBusinesses.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] max-h-40 overflow-y-auto">
          <div className="p-3 bg-white rounded-lg shadow-md">
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Entreprises à proximité ({filteredBusinesses.length})
            </h4>
            <div className="space-y-1">
              {filteredBusinesses.slice(0, 5).map((business) => {
                const distance = userLocation ? 
                  calculateDistance(
                    userLocation.lat, 
                    userLocation.lng, 
                    business.latitude, 
                    business.longitude
                  ) : null;

                return (
                  <div key={business.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {business.name}
                      </p>
                      {distance && (
                        <p className="text-xs text-gray-500">
                          {distance.toFixed(1)} km
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => onBusinessClick(business)}
                        className="p-1 text-blue-600 rounded hover:bg-blue-50"
                        title="Voir détails"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigateToBusiness(business)}
                        className="p-1 text-green-600 rounded hover:bg-green-50"
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
        </div>
      )}
    </div>
  );
};

export default MapView;
