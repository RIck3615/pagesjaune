import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail, 
  ExternalLink,
  ChevronRight,
  Building2,
  Utensils,
  ShoppingCart,
  Wrench,
  Car,
  Stethoscope,
  Scale,
  HomeIcon,
  Briefcase,
  Heart,
  Eye
} from 'lucide-react';
import SearchBar from '../components/Search/SearchBar';
import BusinessList from '../components/Business/BusinessList';
import { businessService, categoryService } from '../services/api';

const Home = () => {
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentBusinesses, setRecentBusinesses] = useState([]);

  // Catégories populaires avec icônes
  const popularCategories = [
    { name: 'Restaurants', icon: Utensils, color: 'text-red-600' },
    { name: 'Dentistes', icon: Stethoscope, color: 'text-blue-600' },
    { name: 'Cliniques médicales', icon: Heart, color: 'text-green-600' },
    { name: 'Réparation de voitures', icon: Car, color: 'text-orange-600' },
    { name: 'Épiceries', icon: ShoppingCart, color: 'text-purple-600' },
    { name: 'Avocats', icon: Scale, color: 'text-indigo-600' },
    { name: 'Plombiers', icon: Wrench, color: 'text-yellow-600' },
    { name: 'Électriciens', icon: Briefcase, color: 'text-pink-600' }
  ];

  // Villes populaires
  const popularCities = [
    'Kinshasa', 'Lubumbashi', 'Mbuji-Mayi', 'Kananga', 'Kisangani',
    'Bukavu', 'Goma', 'Matadi', 'Kikwit', 'Tshikapa',
    'Kolwezi', 'Likasi', 'Kalemie', 'Mbandaka', 'Uvira'
  ];

  useEffect(() => {
    loadInitialData();
    loadRecentData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Chargement des données initiales...');
      
      // Charger les entreprises en vedette (toutes les entreprises vérifiées)
      const businessesResponse = await businessService.getAll({
        verified: true,
        per_page: 6
      });
      
      console.log('Réponse entreprises:', businessesResponse.data);
      setFeaturedBusinesses(businessesResponse.data.data.data);

      // Charger les catégories principales
      const categoriesResponse = await categoryService.getAll({ root_only: true });
      console.log('Réponse catégories:', categoriesResponse.data);
      setCategories(categoriesResponse.data.data.slice(0, 8));

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentData = () => {
    // Charger les recherches récentes depuis localStorage
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(searches.slice(0, 5));

    // Charger les entreprises récemment consultées
    const businesses = JSON.parse(localStorage.getItem('recentBusinesses') || '[]');
    setRecentBusinesses(businesses.slice(0, 5));
  };

  const handleSearch = async (query, filters = {}) => {
    try {
      setIsSearching(true);
      
      // Sauvegarder la recherche récente
      const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const newSearches = [query, ...searches.filter(s => s !== query)].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      
      const response = await businessService.getAll({
        search: query,
        ...filters,
        per_page: 12
      });
      setSearchResults(response.data.data.data);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBusinessClick = (business) => {
    // Sauvegarder l'entreprise consultée
    const businesses = JSON.parse(localStorage.getItem('recentBusinesses') || '[]');
    const newBusinesses = [business, ...businesses.filter(b => b.id !== business.id)].slice(0, 10);
    localStorage.setItem('recentBusinesses', JSON.stringify(newBusinesses));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Style Pages Jaunes */}
      <section className="py-8 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
              La recherche locale commence ici
            </h1>
          </div>
          
          {/* Barre de recherche principale */}
          <div className="max-w-4xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              categories={categories}
              className="bg-white border-2 border-gray-300 focus-within:border-yellow-500"
              placeholder="Que recherchez-vous?"
              locationPlaceholder="Où recherchez-vous?"
            />
          </div>
        </div>
      </section>

      {/* Catégories populaires */}
      <section className="py-8 bg-white border-t">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-8">
            {popularCategories.map((category, index) => (
              <Link
                key={index}
                to={`/search?category=${category.name}`}
                className="flex flex-col items-center p-4 transition-colors rounded-lg hover:bg-gray-50 group"
              >
                <category.icon className={`h-8 w-8 mb-2 ${category.color} group-hover:scale-110 transition-transform`} />
                <span className="text-sm font-medium text-center text-gray-700">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recherches récentes et entreprises consultées */}
      {(recentSearches.length > 0 || recentBusinesses.length > 0) && (
        <section className="py-8 bg-gray-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Recherches récentes */}
              {recentSearches.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Vos recherches locales récentes
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Retrouvez vos recherches. Utile si vous faites souvent la même recherche!
                  </p>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        to={`/search?q=${encodeURIComponent(search)}`}
                        className="block p-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700">{search}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Entreprises récemment consultées */}
              {recentBusinesses.length > 0 && (
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Vos entreprises locales récemment consultées
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Créez votre carnet d'adresses. Pratique pour retrouver leurs coordonnées!
                  </p>
                  <div className="space-y-2">
                    {recentBusinesses.map((business, index) => (
                      <Link
                        key={index}
                        to={`/business/${business.id}`}
                        onClick={() => handleBusinessClick(business)}
                        className="block p-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{business.name}</div>
                            <div className="text-sm text-gray-600">{business.address}</div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Sections thématiques */}
      <section className="py-8 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Vous cherchez des idées ?</h2>
          
          <div className="grid gap-8 md:grid-cols-3">
            {/* Services Pro */}
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Wrench className="w-5 h-5 mr-2 text-blue-600" />
                Services Pro
              </h3>
              <div className="space-y-3">
                <Link to="/search?category=Cuisine" className="block transition-colors hover:text-blue-600">
                  <div className="font-medium">Cuisine</div>
                  <div className="text-sm text-gray-600">5 façons de rajeunir votre cuisine sans tracas</div>
                </Link>
                <Link to="/search?category=Rénovations" className="block transition-colors hover:text-blue-600">
                  <div className="font-medium">Rénovations</div>
                  <div className="text-sm text-gray-600">4 projets de rénovation à faire en une fin de semaine</div>
                </Link>
                <Link to="/search?category=Plomberie" className="block transition-colors hover:text-blue-600">
                  <div className="font-medium">Plomberie</div>
                  <div className="text-sm text-gray-600">3 conseils pour trouver un plombier en urgence</div>
                </Link>
              </div>
            </div>

            {/* Resto */}
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <Utensils className="w-5 h-5 mr-2 text-red-600" />
                Resto
              </h3>
              <div className="space-y-3">
                <Link to="/search?category=Restaurants" className="block transition-colors hover:text-red-600">
                  <div className="font-medium">Restaurants</div>
                  <div className="text-sm text-gray-600">Envie d'un steak? Top 10 des meilleures grilladeries</div>
                </Link>
                <Link to="/search?category=Pizza" className="block transition-colors hover:text-red-600">
                  <div className="font-medium">Pizza</div>
                  <div className="text-sm text-gray-600">10 pizzérias incontournables</div>
                </Link>
                <Link to="/search?category=Beignes" className="block transition-colors hover:text-red-600">
                  <div className="font-medium">Beignes</div>
                  <div className="text-sm text-gray-600">10 beignes bons à s'en lécher les doigts</div>
                </Link>
              </div>
            </div>

            {/* Épicerie */}
            <div className="p-6 rounded-lg bg-gray-50">
              <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                Épicerie
              </h3>
              <div className="space-y-3">
                <Link to="/search?category=Épicerie" className="block transition-colors hover:text-green-600">
                  <div className="font-medium">Épicerie</div>
                  <div className="text-sm text-gray-600">8 conseils pour manger sainement sur un budget</div>
                </Link>
                <Link to="/search?category=Produits alimentaires" className="block transition-colors hover:text-green-600">
                  <div className="font-medium">Produits alimentaires</div>
                  <div className="text-sm text-gray-600">4 mythes communs démystifiés!</div>
                </Link>
                <Link to="/search?category=Achats" className="block transition-colors hover:text-green-600">
                  <div className="font-medium">Achats</div>
                  <div className="text-sm text-gray-600">8 trucs pour des achats économiques et écologiques</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recherches locales populaires */}
      <section className="py-8 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Recherches Locales Populaires</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {[
              'Dentistes', 'Avocats', 'Plombiers', 'Électriciens', 'Couvreurs', 'Garages',
              'Entrepreneurs', 'Vétérinaires', 'Restaurants', 'Rénovations', 'Assurance',
              'Chiropraticiens', 'Déménagement', 'Salons de coiffure', 'Pizza', 'Comptables',
              'Peintres', 'Extermination', 'Clôtures', 'Courtiers immobiliers', 'Physiothérapeutes'
            ].map((search, index) => (
              <Link
                key={index}
                to={`/search?q=${encodeURIComponent(search)}`}
                className="p-3 text-sm font-medium text-center text-gray-700 transition-colors bg-white rounded-lg hover:bg-gray-50 hover:text-gray-900"
              >
                {search}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Villes populaires */}
      <section className="py-8 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Endroits populaires en RDC</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {popularCities.map((city, index) => (
              <Link
                key={index}
                to={`/search?location=${encodeURIComponent(city)}`}
                className="p-3 text-sm font-medium text-center text-gray-700 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 hover:text-gray-900"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Entreprises en vedette */}
      {featuredBusinesses.length > 0 && (
        <section className="py-8 bg-gray-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Découvrez les entreprises locales</h2>
            
            {loading ? (
              <div className="py-12 text-center">
                <div className="inline-block w-8 h-8 border-b-2 border-yellow-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Chargement...</p>
              </div>
            ) : (
              <BusinessList
                businesses={featuredBusinesses}
                className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
                onBusinessClick={handleBusinessClick}
              />
            )}
          </div>
        </section>
      )}

      {/* Résultats de recherche */}
      {isSearching && searchResults.length > 0 && (
        <section className="py-8 bg-white">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Résultats de recherche</h2>
            <BusinessList
              businesses={searchResults}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              onBusinessClick={handleBusinessClick}
            />
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-yellow-50">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Stimulez la croissance de votre entreprise avec PagesJaunes CD
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-gray-600">
            Rejoignez notre annuaire et augmentez votre visibilité en ligne. 
            Créez votre profil gratuitement ou optez pour un abonnement premium.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 font-medium text-white transition-colors bg-yellow-500 rounded-lg hover:bg-yellow-600"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/register?type=business"
              className="inline-flex items-center px-6 py-3 font-medium text-gray-900 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Inscrire mon entreprise
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;