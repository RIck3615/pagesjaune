import React from 'react';
import { Map, Satellite } from 'lucide-react';

const MapTypeSelector = ({ 
  mapType, 
  onMapTypeChange, 
  className = "",
  size = "default"
}) => {
  const mapTypes = [
    { id: 'osm', name: 'Plan', icon: Map },
    { id: 'satellite', name: 'Satellite', icon: Satellite }
  ];

  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div className={`flex bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {mapTypes.map((type) => {
        const Icon = type.icon;
        const isActive = mapType === type.id;
        
        return (
          <button
            key={type.id}
            onClick={() => onMapTypeChange(type.id)}
            className={`
              flex items-center justify-center
              ${sizeClasses[size]}
              ${isActive 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-700 hover:bg-gray-50'
              }
              transition-colors duration-200
            `}
            title={type.name}
          >
            <Icon className={`${iconSizes[size]} ${size !== 'small' ? 'mr-2' : ''}`} />
            {size !== 'small' && type.name}
          </button>
        );
      })}
    </div>
  );
};

export default MapTypeSelector;
