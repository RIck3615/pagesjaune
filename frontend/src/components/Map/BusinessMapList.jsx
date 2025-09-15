import React from 'react';
import { MapPin, Navigation, Phone, ExternalLink } from 'lucide-react';
import { formatDistance, getNavigationUrl } from '../../utils/geolocation';

const BusinessMapList = ({ 
  businesses = [], 
  onBusinessClick, 
  userLocation,
  maxHeight = 200,
  className = ""
}) => {
  if (businesses.length === 0) {
    return null;
  }

  const handleNavigation = (business) => {
    if (!business.latitude || !business.longitude) {
      alert('Coordonnées GPS non disponibles pour cette entreprise.');
      return;
    }

    const url = getNavigationUrl(business.latitude, business.longitude);
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-3 border-b">
        <h4 className="text-sm font-medium text-gray-900">
          Entreprises à proximité ({businesses.length})
        </h4>
      </div>
      
      <div 
        className="overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div className="space-y-1 p-2">
          {businesses.map((business) => {
            const distance = userLocation && business.distance 
              ? business.distance 
              : null;

            return (
              <div 
                key={business.id} 
                className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-medium text-gray-900 truncate">
                    {business.name}
                  </h5>
                  <p className="text-xs text-gray-600 truncate">
                    {business.address}
                  </p>
                  {business.phone && (
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {business.phone}
                    </p>
                  )}
                  {distance && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistance(distance)}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => onBusinessClick(business)}
                    className="p-1 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                    title="Voir détails"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleNavigation(business)}
                    className="p-1 text-green-600 rounded hover:bg-green-50 transition-colors"
                    title="Navigation GPS"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                  
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                      title="Site web"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BusinessMapList;
