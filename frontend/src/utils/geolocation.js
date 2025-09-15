// Utilitaires pour la géolocalisation

/**
 * Obtient la position actuelle de l'utilisateur
 * @param {Object} options - Options pour la géolocalisation
 * @returns {Promise<Object>} Position de l'utilisateur
 */
export const getCurrentPosition = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 300000, // 5 minutes
    ...options
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par ce navigateur.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let message = 'Impossible d\'obtenir votre position.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permission de géolocalisation refusée. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Position non disponible. Vérifiez votre connexion internet.';
            break;
          case error.TIMEOUT:
            message = 'Délai d\'attente dépassé. Veuillez réessayer.';
            break;
        }
        
        reject(new Error(message));
      },
      defaultOptions
    );
  });
};

/**
 * Calcule la distance entre deux points géographiques
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lon1 - Longitude du premier point
 * @param {number} lat2 - Latitude du deuxième point
 * @param {number} lon2 - Longitude du deuxième point
 * @returns {number} Distance en kilomètres
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Formate la distance pour l'affichage
 * @param {number} distance - Distance en kilomètres
 * @returns {string} Distance formatée
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

/**
 * Génère une URL de navigation GPS
 * @param {number} latitude - Latitude de destination
 * @param {number} longitude - Longitude de destination
 * @param {string} provider - Fournisseur de cartes ('google', 'apple', 'osm')
 * @returns {string} URL de navigation
 */
export const getNavigationUrl = (latitude, longitude, provider = 'google') => {
  switch (provider) {
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    case 'apple':
      return `http://maps.apple.com/?daddr=${latitude},${longitude}`;
    case 'osm':
      return `https://www.openstreetmap.org/directions?to=${latitude},${longitude}`;
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
};

/**
 * Vérifie si les coordonnées sont valides
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} True si les coordonnées sont valides
 */
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Obtient le centre géographique d'un ensemble de points
 * @param {Array} points - Tableau de points {lat, lng}
 * @returns {Object} Centre géographique {lat, lng}
 */
export const getGeographicCenter = (points) => {
  if (points.length === 0) {
    return { lat: 0, lng: 0 };
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length
  };
};

/**
 * Filtre les entreprises par distance
 * @param {Array} businesses - Liste des entreprises
 * @param {Object} userLocation - Position de l'utilisateur {lat, lng}
 * @param {number} maxDistance - Distance maximale en km
 * @returns {Array} Entreprises filtrées avec distance
 */
export const filterBusinessesByDistance = (businesses, userLocation, maxDistance) => {
  if (!userLocation || !isValidCoordinates(userLocation.lat, userLocation.lng)) {
    return businesses;
  }

  return businesses
    .filter(business => 
      business.latitude && 
      business.longitude && 
      isValidCoordinates(business.latitude, business.longitude)
    )
    .map(business => ({
      ...business,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        business.latitude,
        business.longitude
      )
    }))
    .filter(business => business.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Obtient les coordonnées par défaut pour la RDC
 * @returns {Object} Coordonnées par défaut {lat, lng, zoom}
 */
export const getDefaultRDC = () => ({
  lat: -4.4419,
  lng: 15.2663,
  zoom: 6
});

/**
 * Obtient les coordonnées par défaut pour Kinshasa
 * @returns {Object} Coordonnées par défaut {lat, lng, zoom}
 */
export const getDefaultKinshasa = () => ({
  lat: -4.4419,
  lng: 15.2663,
  zoom: 11
});
