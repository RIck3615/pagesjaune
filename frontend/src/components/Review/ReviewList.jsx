import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { reviewService } from '../../services/api';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { Star, MessageSquare, Plus } from 'lucide-react';

const ReviewList = ({ businessId, businessName, canReview = false }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Fetch reviews
  const { data: reviewsData, isLoading, error } = useQuery(
    ['reviews', businessId],
    () => reviewService.getAll({ business_id: businessId }),
    {
      select: (response) => response.data.data,
    }
  );

  const reviews = reviewsData?.data || [];
  const averageRating = reviewsData?.average_rating || 0;
  const totalReviews = reviewsData?.total || 0;

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = (review) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      // Implémenter la suppression
      console.log('Delete review:', review.id);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse">
            <div className="flex items-center mb-3 space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-16 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="w-full h-4 bg-gray-200 rounded" />
              <div className="w-3/4 h-4 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête des avis */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center text-lg font-semibold text-gray-900">
            <MessageSquare className="w-5 h-5 mr-2" />
            Avis clients
          </h3>
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Laisser un avis
            </button>
          )}
        </div>

        {/* Note moyenne */}
        {totalReviews > 0 && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              {renderStars(averageRating)}
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <span className="ml-1 text-gray-600">
                sur 5 ({totalReviews} avis)
              </span>
            </div>
          </div>
        )}

        {totalReviews === 0 && (
          <div className="py-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4 text-gray-500">
              Aucun avis pour le moment
            </p>
            {canReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Être le premier à laisser un avis
              </button>
            )}
          </div>
        )}
      </div>

      {/* Liste des avis */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEditReview}
              onDelete={handleDeleteReview}
              showActions={canReview}
            />
          ))}
        </div>
      )}

      {/* Formulaire d'avis */}
      {showReviewForm && (
        <ReviewForm
          businessId={businessId}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
          onSuccess={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
        />
      )}
    </div>
  );
};

export default ReviewList;
