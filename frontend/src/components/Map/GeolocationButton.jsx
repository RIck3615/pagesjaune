import React from 'react';
import { Navigation, Loader2 } from 'lucide-react';
import useGeolocation from '../../hooks/useGeolocation';

const GeolocationButton = ({ 
  onLocationChange, 
  className = "",
  size = "default",
  showText = true,
  disabled = false
}) => {
  const { location, loading, error, getLocation } = useGeolocation({
    autoGetLocation: false
  });

  const handleClick = async () => {
    if (disabled || loading) return;
    
    try {
      await getLocation();
    } catch (err) {
      console.error('Erreur de géolocalisation:', err);
    }
  };

  // Notifier le parent quand la position change
  React.useEffect(() => {
    if (location && onLocationChange) {
      onLocationChange(location);
    }
  }, [location, onLocationChange]);

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
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center
        ${sizeClasses[size]}
        bg-blue-600 text-white rounded-lg
        hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      title={error ? error.message : 'Obtenir ma position'}
    >
      {loading ? (
        <Loader2 className={`${iconSizes[size]} mr-2 animate-spin`} />
      ) : (
        <Navigation className={`${iconSizes[size]} ${showText ? 'mr-2' : ''}`} />
      )}
      {showText && (
        <span>
          {loading ? 'Localisation...' : 'Ma position'}
        </span>
      )}
    </button>
  );
};

export default GeolocationButton;
