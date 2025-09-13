import React from 'react';
import { useAuth } from '../hooks/useAuth';
import BusinessForm from '../components/Business/BusinessForm';

const CreateBusiness = () => {
  const { isAuthenticated, isBusiness } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600">Vous devez être connecté pour créer une entreprise.</p>
        </div>
      </div>
    );
  }

  if (!isBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600">Seuls les comptes entreprise peuvent créer des entreprises.</p>
        </div>
      </div>
    );
  }

  return <BusinessForm />;
};

export default CreateBusiness;
