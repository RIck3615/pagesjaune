import React from 'react';
import BusinessCard from './BusinessCard';
import { Loader2 } from 'lucide-react';

const BusinessList = ({ 
  businesses = [], 
  loading = false, 
  error = null, 
  className = "",
  onBusinessClick = null
}) => {
  if (loading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600">Chargement des entreprises...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mb-2 text-red-600">
          <h3 className="text-lg font-semibold">Erreur de chargement</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-gray-500">
          <h3 className="mb-2 text-lg font-semibold">Aucune entreprise trouvée</h3>
          <p className="text-sm">
            Essayez de modifier vos critères de recherche ou de parcourir les catégories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {businesses.map((business) => (
        <BusinessCard
          key={business.id}
          business={business}
          onBusinessClick={onBusinessClick}
        />
      ))}
    </div>
  );
};

export default BusinessList;

