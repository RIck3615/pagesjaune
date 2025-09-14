import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { reviewService } from '../../services/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ businessId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  const submitReviewMutation = useMutation(
    (reviewData) => reviewService.create(reviewData),
    {
      onSuccess: (response) => {
        toast.success('Avis soumis avec succès ! Il sera publié après modération.');
        queryClient.invalidateQueries(['business', businessId]);
        queryClient.invalidateQueries(['reviews', businessId]);
        if (onSuccess) onSuccess(response.data);
        if (onClose) onClose();
      },
      onError: (error) => {
        const message = error.response?.data?.message || 'Erreur lors de la soumission de l\'avis';
        toast.error(message);
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    submitReviewMutation.mutate({
      business_id: businessId,
      rating,
      comment: comment.trim() || null
    });
  };

  const renderStars = () => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          className={`p-1 transition-colors ${
            isFilled ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starValue)}
        >
          <Star className={`w-8 h-8 ${isFilled ? 'fill-current' : ''}`} />
        </button>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md mx-4 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Laisser un avis</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Note */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-medium text-gray-700">
              Note *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              <span className="ml-3 text-sm text-gray-600">
                {rating}/5
              </span>
            </div>
          </div>

          {/* Commentaire */}
          <div className="mb-6">
            <label htmlFor="comment" className="block mb-2 text-sm font-medium text-gray-700">
              Commentaire (optionnel)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
              placeholder="Partagez votre expérience avec cette entreprise..."
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">
                Maximum 1000 caractères
              </span>
              <span className="text-xs text-gray-500">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitReviewMutation.isLoading}
              className="inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitReviewMutation.isLoading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
