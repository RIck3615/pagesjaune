import React from 'react';
import { MapPin, Navigation, Eye, Building2 } from 'lucide-react';

const MapStats = ({ 
  totalBusinesses = 0,
  visibleBusinesses = 0,
  businessesWithGPS = 0,
  userLocation = null,
  className = ""
}) => {
  const stats = [
    {
      label: 'Total',
      value: totalBusinesses,
      icon: Building2,
      color: 'text-gray-600'
    },
    {
      label: 'Affichées',
      value: visibleBusinesses,
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      label: 'Avec GPS',
      value: businessesWithGPS,
      icon: MapPin,
      color: 'text-green-600'
    }
  ];

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <h4 className="mb-3 text-sm font-medium text-gray-900">
        Statistiques
      </h4>
      
      <div className="space-y-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Icon className={`w-4 h-4 mr-2 ${stat.color}`} />
                <span className="text-gray-600">{stat.label}:</span>
              </div>
              <span className={`font-medium ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {userLocation && (
        <div className="pt-3 mt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-gray-500">
            <Navigation className="w-3 h-3 mr-1" />
            <span>Position détectée</span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default MapStats;
