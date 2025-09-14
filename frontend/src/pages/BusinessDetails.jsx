import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { businessService, reviewService } from '../services/api'
import { useAuth } from '../hooks/useAuth.jsx'
import ReviewCard from '../components/ReviewCard'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Clock, 
  Crown, 
  CheckCircle,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getImageUrl } from '../utils/images';

const BusinessDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  })

  // États pour le lightbox
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch business details
  const { data: business, isLoading, error } = useQuery(
    ['business', id],
    () => businessService.getById(id),
    {
      select: (response) => response.data.data,
    }
  )

  // Submit review mutation
  const submitReviewMutation = useMutation(
    (reviewData) => reviewService.create(id, reviewData),
    {
      onSuccess: () => {
        toast.success('Avis soumis avec succès ! Il sera publié après modération.')
        setShowReviewForm(false)
        setReviewForm({ rating: 5, comment: '' })
        queryClient.invalidateQueries(['business', id])
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la soumission')
      }
    }
  )

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour laisser un avis')
      return
    }
    submitReviewMutation.mutate(reviewForm)
  }

  // Fonctions pour le lightbox
  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    // Empêcher le scroll du body quand le modal est ouvert
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === business.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? business.images.length - 1 : prev - 1
    );
  };

  const handleKeyDown = (e) => {
    if (!showLightbox) return;
    
    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowRight':
        nextImage();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
    }
  };

  // AJOUTER CETTE FONCTION MANQUANTE :
  const renderHours = (hours) => {
    const dayNames = {
      'lundi': 'Lundi',
      'mardi': 'Mardi', 
      'mercredi': 'Mercredi',
      'jeudi': 'Jeudi',
      'vendredi': 'Vendredi',
      'samedi': 'Samedi',
      'dimanche': 'Dimanche'
    };

    return (
      <div className="space-y-2">
        {hours.map((day, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="font-medium text-gray-700">
              {dayNames[day.day] || day.day}
            </span>
            <div className="flex items-center space-x-2">
              {day.is_open === '1' || day.is_open === 1 ? (
                <>
                  <span className="text-sm text-green-600">Ouvert</span>
                  <span className="text-sm text-gray-600">
                    {day.open_time} - {day.close_time}
                  </span>
                </>
              ) : (
                <span className="text-sm text-red-600">Fermé</span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderRating = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  // Ajouter l'event listener pour les touches
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Nettoyer au démontage
    };
  }, [showLightbox]);

  // Au début du composant, ajouter ce useEffect pour gérer le scroll
  useEffect(() => {
    return () => {
      // Nettoyer le style du body au démontage du composant
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="w-1/4 h-8 mb-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-4 mb-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="px-4 py-8 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Entreprise non trouvée
        </h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retour à l'accueil
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 space-x-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour</span>
      </button>

      {/* Business Header */}
      <div className="p-6 mb-8 bg-white border rounded-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4 space-x-3">
              {business.is_premium && (
                <Crown className="w-6 h-6 text-yellow-500" title="Entreprise premium" />
              )}
              {business.is_verified && (
                <CheckCircle className="w-6 h-6 text-green-500" title="Entreprise vérifiée" />
              )}
            </div>
            
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              {business.name}
            </h1>
            
            <div className="flex items-center mb-4 space-x-4">
              <div className="flex items-center space-x-1">
                {renderRating(Math.round(business.average_rating || 0))}
                <span className="ml-2 text-lg font-medium text-gray-900">
                  {(business.average_rating || 0).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({business.reviews_count || 0} avis)
                </span>
              </div>
            </div>
            
            <p className="text-lg leading-relaxed text-gray-700">
              {business.description}
            </p>
          </div>
          
          <div className="mt-6 lg:mt-0 lg:ml-8">
            {business.logo && (
              <img
                src={getImageUrl(business.logo)}
                alt={`Logo de ${business.name}`}
                className="object-cover w-32 h-32 border rounded-lg"
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Contact Information */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Informations de contact
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-gray-900">{business.address}</p>
                  <p className="text-gray-600">{business.city}, {business.province}</p>
                </div>
              </div>
              
              {business.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
              
              {business.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {business.email}
                  </a>
                </div>
              )}
              
              {business.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <a
                    href={business.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Site web
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Categories */}
          {business.categories && business.categories.length > 0 && (
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Catégories
              </h2>
              <div className="flex flex-wrap gap-2">
                {business.categories.map((category) => (
                  <span
                    key={category.id}
                    className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images de l'entreprise */}
          {business.images && business.images.length > 0 && (
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-gray-900">
                Photos de l'entreprise ({business.images.length})
              </h2>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {business.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(image)}
                      alt={`${business.name} - Photo ${index + 1}`}
                      className="object-cover w-full h-48 transition-shadow border rounded-lg"
                    />
                    
                    {/* Bouton de clic pour ouvrir le lightbox */}
                    <button
                      onClick={() => {
                        setShowLightbox(true);
                        setCurrentImageIndex(index);
                      }}
                      className="absolute inset-0 flex items-center justify-center transition-all bg-black bg-opacity-0 rounded-lg group-hover:bg-opacity-20"
                    >
                      <div className="transition-opacity opacity-0 group-hover:opacity-100">
                        <span className="px-3 py-1 text-sm text-white bg-black bg-opacity-50 rounded">
                          Voir en grand
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="p-6 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Avis clients ({business.reviews_count || 0})
              </h2>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="flex items-center px-4 py-2 space-x-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Laisser un avis</span>
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="p-4 mb-6 border border-gray-200 rounded-lg">
                <h3 className="mb-4 font-semibold text-gray-900">Votre avis</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Note
                    </label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewForm.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Partagez votre expérience..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitReviewMutation.isLoading}
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitReviewMutation.isLoading ? 'Envoi...' : 'Envoyer l\'avis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {business.reviews && business.reviews.length > 0 ? (
              <div className="space-y-4">
                {business.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                Aucun avis pour le moment. Soyez le premier à en laisser un !
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Opening Hours */}
          {business.opening_hours && (
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Clock className="w-5 h-5 mr-2" />
                Horaires d'ouverture
              </h3>
              {renderHours(business.opening_hours)}
            </div>
          )}

          {/* Map */}
          {business.latitude && business.longitude && (
            <div className="p-6 bg-white border rounded-lg shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Localisation
              </h3>
              <div className="flex items-center justify-center w-full h-48 bg-gray-200 rounded-lg">
                <p className="text-gray-500">
                  Carte interactive (Google Maps/MapLibre)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && business.images && business.images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute z-10 p-2 text-white transition-all bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-75"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Bouton précédent */}
            {business.images.length > 1 && (
              <button
                onClick={prevImage}
                className="absolute z-10 p-2 text-white transition-all bg-black bg-opacity-50 rounded-full left-4 hover:bg-opacity-75"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Bouton suivant */}
            {business.images.length > 1 && (
              <button
                onClick={nextImage}
                className="absolute z-10 p-2 text-white transition-all bg-black bg-opacity-50 rounded-full right-4 hover:bg-opacity-75"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image principale */}
            <div className="max-w-4xl max-h-full p-4">
              <img
                src={getImageUrl(business.images[currentImageIndex])}
                alt={`${business.name} - Photo ${currentImageIndex + 1}`}
                className="object-contain w-full h-full rounded-lg"
              />
            </div>

            {/* Indicateur de position */}
            {business.images.length > 1 && (
              <div className="absolute transform -translate-x-1/2 bottom-4 left-1/2">
                <div className="flex space-x-2">
                  {business.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Informations de l'image */}
            <div className="absolute text-white bottom-4 left-4">
              <p className="text-sm opacity-75">
                {currentImageIndex + 1} / {business.images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDetails
