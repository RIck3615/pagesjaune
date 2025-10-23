import { Link } from 'react-router-dom'
import { MapPin, Phone, Star, Crown, CheckCircle } from 'lucide-react'

const BusinessCard = ({ business }) => {
  const renderRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 text-yellow-400 fill-yellow-400" />
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      )
    }

    return stars
  }

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {business.is_premium && (
            <Crown className="w-4 h-4 text-yellow-500 sm:w-5 sm:h-5" title="Entreprise premium" />
          )}
          {business.is_verified && (
            <CheckCircle className="w-4 h-4 text-green-500 sm:w-5 sm:h-5" title="Entreprise vérifiée" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          {renderRating(business.average_rating)}
          <span className="ml-1 text-xs text-gray-600 sm:text-sm">
            ({business.reviews_count})
          </span>
        </div>
      </div>

      <Link to={`/business/${business.id}`} className="block">
        <h3 className="mb-2 text-base font-semibold text-gray-900 transition-colors sm:text-lg hover:text-primary-600">
          {business.name}
        </h3>
      </Link>

      <p className="mb-3 text-xs text-gray-600 sm:text-sm line-clamp-2">
        {business.description}
      </p>

      <div className="mb-4 space-y-2">
        <div className="flex items-center space-x-2 text-gray-500">
          <MapPin className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm">{business.address}, {business.city}</span>
        </div>
        {business.phone && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Phone className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{business.phone}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {business.categories?.slice(0, 3).map((category) => (
          <span
            key={category.id}
            className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full"
          >
            {category.name}
          </span>
        ))}
        {business.categories?.length > 3 && (
          <span className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full">
            +{business.categories.length - 3}
          </span>
        )}
      </div>

      <Link
        to={`/business/${business.id}`}
        className="w-full text-sm text-center btn btn-outline sm:text-base"
      >
        Voir les détails
      </Link>
    </div>
  )
}

export default BusinessCard
