import { Link } from 'react-router-dom'
import { MapPin, Phone, Star, Crown, CheckCircle } from 'lucide-react'

const BusinessCard = ({ business }) => {
  const renderRating = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {business.is_premium && (
            <Crown className="w-5 h-5 text-yellow-500" title="Entreprise premium" />
          )}
          {business.is_verified && (
            <CheckCircle className="w-5 h-5 text-green-500" title="Entreprise vérifiée" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          {renderRating(business.average_rating)}
          <span className="text-sm text-gray-600 ml-1">
            ({business.reviews_count})
          </span>
        </div>
      </div>

      <Link to={`/business/${business.id}`} className="block">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
          {business.name}
        </h3>
      </Link>

      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {business.description}
      </p>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-500">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{business.address}, {business.city}</span>
        </div>
        {business.phone && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Phone className="w-4 h-4" />
            <span className="text-sm">{business.phone}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {business.categories?.slice(0, 3).map((category) => (
          <span
            key={category.id}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {category.name}
          </span>
        ))}
        {business.categories?.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            +{business.categories.length - 3}
          </span>
        )}
      </div>

      <Link
        to={`/business/${business.id}`}
        className="btn btn-outline w-full text-center"
      >
        Voir les détails
      </Link>
    </div>
  )
}

export default BusinessCard
