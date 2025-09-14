import React from 'react';
import { Star, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const ReviewCard = ({ review, onEdit, onDelete, showActions = false }) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = user && review.user_id === user.id;

  const renderRating = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'En attente' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approuvé' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejeté' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="relative p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
            <span className="text-sm font-semibold text-blue-600">
              {review.user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{review.user?.name}</h4>
            <p className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            {renderRating(review.rating)}
          </div>
          
          {/* Menu d'actions pour le propriétaire de l'avis */}
          {showActions && isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onEdit && onEdit(review);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        onDelete && onDelete(review);
                        setShowMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Statut de l'avis (pour l'utilisateur propriétaire) */}
      {isOwner && (
        <div className="mb-3">
          {getStatusBadge(review.status)}
        </div>
      )}
      
      {/* Commentaire */}
      {review.comment && (
        <p className="leading-relaxed text-gray-700">{review.comment}</p>
      )}
      
      {/* Message pour les avis en attente */}
      {isOwner && review.status === 'pending' && (
        <div className="p-3 mt-3 border border-yellow-200 rounded-md bg-yellow-50">
          <p className="text-sm text-yellow-800">
            Votre avis est en cours de modération et sera publié une fois approuvé.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
