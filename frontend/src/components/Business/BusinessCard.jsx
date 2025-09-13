import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, Clock, ExternalLink, Crown, CheckCircle } from 'lucide-react';

const BusinessCard = ({ business, className = "", onBusinessClick }) => {
  const {
    id,
    name,
    description,
    address,
    city,
    province,
    phone,
    website,
    logo,
    average_rating,
    reviews_count,
    is_premium,
    is_verified,
    categories = []
  } = business;

  const handleClick = () => {
    if (onBusinessClick) {
      onBusinessClick(business);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200 ${className}`}>
      <div className="p-6">
        {/* En-tête avec logo et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {logo ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${logo}`}
                alt={`Logo de ${name}`}
                className="object-cover w-12 h-12 rounded-lg"
              />
            ) : (
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-lg font-semibold text-blue-600">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center mt-1 space-x-2">
                {is_verified && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vérifié
                  </span>
                )}
                {is_premium && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-gray-600 line-clamp-2">
          {description?.length > 120 ? `${description.substring(0, 120)}...` : description}
        </p>

        {/* Catégories */}
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 rounded-md bg-blue-50"
                >
                  {category.name}
                </span>
              ))}
              {categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md">
                  +{categories.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            <span className="line-clamp-1">{address}, {city}, {province}</span>
          </div>
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-blue-500" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Note et avis */}
        {(average_rating || 0) > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(average_rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-1 text-sm font-medium text-gray-900">
                {(average_rating || 0).toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {reviews_count || 0} avis
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/business/${id}`}
            onClick={handleClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
          >
            Voir les détails
          </Link>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <ExternalLink className="h-4 mr-1" />
              Site web
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
