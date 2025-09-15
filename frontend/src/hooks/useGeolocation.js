import { useState, useEffect, useCallback } from 'react';
import { getCurrentPosition, isValidCoordinates } from '../utils/geolocation';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supported, setSupported] = useState(false);

  // Vérifier si la géolocalisation est supportée
  useEffect(() => {
    setSupported('geolocation' in navigator);
  }, []);

  // Obtenir la position actuelle
  const getLocation = useCallback(async (customOptions = {}) => {
    if (!supported) {
      setError(new Error('La géolocalisation n\'est pas supportée par ce navigateur.'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition({ ...options, ...customOptions });
      
      if (isValidCoordinates(position.lat, position.lng)) {
        setLocation(position);
      } else {
        throw new Error('Coordonnées GPS invalides.');
      }
    } catch (err) {
      setError(err);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  }, [supported, options]);

  // Effacer la position
  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  // Obtenir la position automatiquement au montage
  useEffect(() => {
    if (supported && options.autoGetLocation !== false) {
      getLocation();
    }
  }, [supported, getLocation, options.autoGetLocation]);

  return {
    location,
    loading,
    error,
    supported,
    getLocation,
    clearLocation
  };
};

export default useGeolocation;
