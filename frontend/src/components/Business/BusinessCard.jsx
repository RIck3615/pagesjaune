import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, Clock, ExternalLink } from 'lucide-react';
import { formatUtils } from '../../utils/format';

const BusinessCard = ({ business, className = "" }) => {
  const {
    id,
    name,
    slug,
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
    categories = [],
    opening_hours
  } = business;

  const rating = formatUtils.rating(average_rating);
  const fullAddress = formatUtils.address(business);
  const truncatedDescription = formatUtils.truncate(description, 120);

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-primary-200 ${className}`}>
      <div className="p-6">
        {/* En-tête avec logo et badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {logo ? (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/storage/${logo}`}
                alt={`Logo de ${name}`}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-semibold text-lg">
                  {name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {name}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {is_verified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
                    ✓ Vérifié
                  </span>
                )}
                {is_premium && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                    ⭐ Premium
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncatedDescription}
        </p>

        {/* Catégories */}
        {categories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {category.name}
                </span>
              ))}
              {categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  +{categories.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Informations de contact */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-primary-500" />
            <span className="line-clamp-1">{fullAddress}</span>
          </div>
          {phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2 text-primary-500" />
              <span>{formatUtils.phone(phone)}</span>
            </div>
          )}
        </div>

        {/* Note et avis */}
        {average_rating > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(average_rating)
                        ? 'text-secondary-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900 ml-1">
                {rating}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {reviews_count} avis
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link
            to={`/business/${slug || id}`}
            className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Voir les détails
          </Link>
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Site web
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
