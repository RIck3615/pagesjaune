import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Building2, Settings, Shield, MapPin, Eye, MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService, statsService } from '../../services/api';
import Logo from '../Logo';

const Header = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visitorCount, setVisitorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isBusiness, logout } = useAuth();
  
  // Refs pour gérer le focus
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Enregistrer la visite et récupérer le compteur
  useEffect(() => {
    const recordVisitAndGetCount = async () => {
      try {
        console.log('🔄 Début de l\'enregistrement de la visite...');
        
        // Enregistrer la visite
        console.log('📝 Enregistrement de la visite...');
        const visitResponse = await statsService.recordVisit({
          country: 'CD',
          city: 'Kinshasa'
        });
        console.log('✅ Visite enregistrée:', visitResponse.data);

        // Récupérer le nombre de visiteurs d'aujourd'hui
        console.log('📊 Récupération du nombre de visiteurs...');
        const response = await statsService.getTodayCount();
        console.log(' Réponse API:', response.data);
        
        if (response.data.success) {
          console.log('🎯 Nombre de visiteurs:', response.data.data.count);
          setVisitorCount(response.data.data.count);
        } else {
          console.error('❌ Erreur dans la réponse API:', response.data);
        }
      } catch (error) {
        console.error('💥 Erreur lors de l\'enregistrement de la visite:', error);
        console.error('📋 Détails de l\'erreur:', error.response?.data || error.message);
        // Fallback : utiliser un nombre simulé
        console.log('🔄 Utilisation du nombre simulé: 1247');
        setVisitorCount(1247);
      } finally {
        console.log('✅ Chargement terminé');
        setIsLoading(false);
      }
    };

    recordVisitAndGetCount();
  }, []);

  // Mettre à jour le compteur toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        console.log(' Mise à jour du compteur...');
        const response = await statsService.getTodayCount();
        console.log('📊 Nouveau nombre de visiteurs:', response.data.data.count);
        if (response.data.success) {
          setVisitorCount(response.data.data.count);
        }
      } catch (error) {
        console.error('💥 Erreur lors de la mise à jour du compteur:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fermer le menu utilisateur quand le focus quitte
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Debug: Afficher l'état actuel
  console.log(' État du Header Layout:', {
    visitorCount,
    isLoading,
    isAuthenticated,
    user: user?.name
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo et nom */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
            </Link>
            
            {/* Compteur de visiteurs */}
            <div className="items-center hidden px-2 py-1 space-x-1 rounded-full sm:flex bg-primary-50">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary-600" />
              <span className="text-xs font-medium sm:text-sm text-primary-700">
                {isLoading ? (
                  <div className="w-12 h-3 rounded sm:w-16 sm:h-4 bg-primary-200 animate-pulse"></div>
                ) : (
                  `${visitorCount.toLocaleString()}`
                )}
              </span>
            </div>
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-1 space-x-1 text-gray-700 rounded-lg sm:p-2 sm:space-x-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden text-xs font-medium sm:text-sm md:block">
                    {user?.name || 'Mon compte'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Mon tableau de bord
                      </Link>
                      <Link
                        to="/my-businesses"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4 mr-3" />
                        Mes entreprises
                      </Link>
                      <Link
                        to="/my-reviews"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <MessageCircle className="w-4 h-4 mr-3" />
                        Mes avis
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Paramètres
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Administration
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link
                  to="/login"
                  className="px-2 py-1 text-xs font-medium text-gray-700 rounded-lg sm:px-4 sm:py-2 sm:text-sm hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-2 py-1 text-xs text-white rounded-lg sm:px-4 sm:py-2 sm:text-sm bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-700 rounded-lg sm:p-2 md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {/* Compteur de visiteurs mobile */}
              <div className="flex items-center justify-center px-3 py-2 space-x-2 rounded-lg bg-primary-50">
                <Eye className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-700">
                  {isLoading ? (
                    <div className="w-20 h-4 rounded bg-primary-200 animate-pulse"></div>
                  ) : (
                    `${visitorCount.toLocaleString()} visiteurs`
                  )}
                </span>
              </div>
              
              {/* Barre de recherche mobile */}
              <form onSubmit={handleSearch} className="px-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Rechercher une entreprise..."
                  />
                </div>
              </form>

              {/* Navigation mobile */}
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/search"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Rechercher
              </Link>
              <Link
                to="/register?type=business"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Inscrire mon entreprise
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

