import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Eye } from 'lucide-react';
import MapView from './MapView';

const MapWidget = ({ businesses = [], className = "" }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (businesses.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Carte des entreprises
          </h3>
          <div className="flex space-x-2">
            <Link
              to="/map"
              className="flex items-center px-3 py-1 text-sm text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              Voir en grand
            </Link>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-50"
            >
              <MapPin className="w-4 h-4 mr-1" />
              {isExpanded ? 'Réduire' : 'Agrandir'}
            </button>
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          {businesses.filter(b => b.latitude && b.longitude).length} entreprises avec coordonnées GPS
        </p>
      </div>

      <div className={`transition-all duration-300 ${isExpanded ? 'h-96' : 'h-64'}`}>
        <MapView
          businesses={businesses.filter(b => b.latitude && b.longitude)}
          onBusinessClick={(business) => {
            // Optionnel : rediriger vers la page de détails
            console.log('Business clicked:', business);
          }}
          className="h-full"
          showUserLocation={true}
          showRadiusFilter={false}
          defaultCenter={[-4.4419, 15.2663]} // Kinshasa
          defaultZoom={10}
        />
      </div>

      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {businesses.filter(b => b.latitude && b.longitude).length} entreprises affichées
          </span>
          <Link
            to="/map"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            Voir toutes les entreprises sur la carte →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MapWidget;
