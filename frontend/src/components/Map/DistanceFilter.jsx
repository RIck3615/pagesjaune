import React from 'react';
import { MapPin, X } from 'lucide-react';

const DistanceFilter = ({ 
  radius, 
  onRadiusChange, 
  userLocation, 
  businessCount,
  className = "",
  minRadius = 1,
  maxRadius = 50
}) => {
  if (!userLocation) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="flex items-center text-sm font-medium text-gray-900">
          <MapPin className="w-4 h-4 mr-2 text-blue-600" />
          Filtre par distance
        </h4>
        <button
          onClick={() => onRadiusChange(maxRadius)}
          className="text-xs text-gray-500 hover:text-gray-700"
          title="Réinitialiser le filtre"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Rayon de recherche: {radius} km
          </label>
          <input
            type="range"
            min={minRadius}
            max={maxRadius}
            value={radius}
            onChange={(e) => onRadiusChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{minRadius} km</span>
            <span>{maxRadius} km</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {businessCount} entreprise(s) trouvée(s)
          </span>
          <span className="font-medium text-blue-600">
            Dans un rayon de {radius} km
          </span>
        </div>

        {userLocation && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Votre position: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceFilter;
