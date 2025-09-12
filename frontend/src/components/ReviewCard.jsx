import { Star } from 'lucide-react'

const ReviewCard = ({ review }) => {
  const renderRating = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-semibold text-sm">
              {review.user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{review.user?.name}</h4>
            <p className="text-sm text-gray-500">
              {new Date(review.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {renderRating(review.rating)}
        </div>
      </div>
      
      {review.comment && (
        <p className="text-gray-700">{review.comment}</p>
      )}
    </div>
  )
}

export default ReviewCard
