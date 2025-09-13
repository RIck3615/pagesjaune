import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { businessService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import BusinessForm from '../components/Business/BusinessForm';

const EditBusiness = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isBusiness, user } = useAuth();

  const { data: business, isLoading, error } = useQuery(
    ['business', id],
    () => businessService.getById(id),
    {
      select: (response) => response.data.data,
    }
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600">Vous devez être connecté pour modifier une entreprise.</p>
        </div>
      </div>
    );
  }

  if (!isBusiness) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600">Seuls les comptes entreprise peuvent modifier des entreprises.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Chargement de l'entreprise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Erreur</h1>
          <p className="mb-6 text-gray-600">Impossible de charger l'entreprise.</p>
          <button
            onClick={() => navigate('/my-businesses')}
            className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Retour à mes entreprises
          </button>
        </div>
      </div>
    );
  }

  if (business.user_id !== user.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Accès non autorisé</h1>
          <p className="text-gray-600">Vous ne pouvez modifier que vos propres entreprises.</p>
        </div>
      </div>
    );
  }

  return <BusinessForm business={business} isEdit={true} />;
};

export default EditBusiness;
