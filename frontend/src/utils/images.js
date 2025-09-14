/**
 * Construit l'URL complète pour une image stockée
 * @param {string} imagePath - Chemin de l'image dans le stockage
 * @returns {string} - URL complète de l'image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si c'est déjà une URL complète, la retourner
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construire l'URL avec la base du stockage
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage';
  return `${storageUrl}/${imagePath}`;
};

/**
 * Construit l'URL complète pour le logo d'une entreprise
 * @param {string} logoPath - Chemin du logo
 * @returns {string|null} - URL du logo ou null si pas de logo
 */
export const getBusinessLogoUrl = (logoPath) => {
  return getImageUrl(logoPath);
};

/**
 * Construit les URLs pour les images d'une entreprise
 * @param {Array} images - Tableau des chemins d'images
 * @returns {Array} - Tableau des URLs complètes
 */
export const getBusinessImagesUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  return images.map(image => getImageUrl(image)).filter(Boolean);
};
