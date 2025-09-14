import React from 'react';
import { useQuery } from 'react-query';
import { reviewService } from '../services/api';
import ReviewCard from '../components/Review/ReviewCard';
import { MessageSquare, Star } from 'lucide-react';

const MyReviews = () => {
  const { data: reviewsData, isLoading, error } = useQuery(
    'my-reviews',
    () => reviewService.getMyReviews(),
    {
      select: (response) => response.data.data,
    }
  );

  const reviews = reviewsData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-4xl px-4 mx-auto">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="max-w-4xl px-4 mx-auto">
        <div className="mb-8">
          <h1 className="flex items-center text-3xl font-bold text-gray-900">
            <MessageSquare className="w-8 h-8 mr-3" />
            Mes avis
          </h1>
          <p className="mt-2 text-gray-600">
            Gérez vos avis et commentaires
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="py-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Aucun avis pour le moment
            </h3>
            <p className="text-gray-500">
              Vous n'avez pas encore laissé d'avis sur des entreprises.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
