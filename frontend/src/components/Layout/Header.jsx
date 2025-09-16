import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut, Building2, Settings, Shield, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api';

const Header = ({ onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, isBusiness, logout } = useAuth();
  
  // Refs pour gérer le focus
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Fermer le menu utilisateur quand le focus quitte
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('focusin', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Fermer le menu mobile quand le focus quitte
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('focusin', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  // Fonction pour obtenir le bon lien de dashboard selon le rôle
  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isBusiness) return '/my-businesses';
    return '/dashboard';
  };

  // Fonction pour obtenir le bon texte de dashboard selon le rôle
  const getDashboardText = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isBusiness) return 'Mes entreprises';
    return 'Tableau de bord';
  };

  // Fonction pour obtenir la bonne icône de dashboard selon le rôle
  const getDashboardIcon = () => {
    if (isAdmin) return <Shield className="w-4 h-4 mr-2" />;
    if (isBusiness) return <Building2 className="w-4 h-4 mr-2" />;
    return <Settings className="w-4 h-4 mr-2" />;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">PagesJaunes.cd</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 hidden max-w-lg mx-8 md:flex">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une entreprise, service..."
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-4 md:flex">
            {/* Lien Carte - Visible pour tous */}
            <Link
              to="/map"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900 hover:bg-gray-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Carte
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center px-2 py-1 space-x-2 text-gray-700 rounded-md hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name}</span>
                  {isAdmin && (
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">
                      Admin
                    </span>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {getDashboardIcon()}
                      {getDashboardText()}
                    </Link>
                    
                    {/* Lien spécifique pour les admins vers la gestion des entreprises */}
                    {isAdmin && (
                      <Link
                        to="/admin/businesses"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Gérer les entreprises
                      </Link>
                    )}

                    <Link
                      to="/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mon abonnement
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-2 py-1 text-gray-700 rounded-md hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-700 rounded-md hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-4 md:hidden">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une entreprise, service..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </form>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="py-4 border-t border-gray-200 md:hidden" ref={mobileMenuRef}>
            {/* Lien Carte - Mobile */}
            <Link
              to="/map"
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => setIsMenuOpen(false)}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Carte
            </Link>

            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm text-gray-500">
                  Connecté en tant que {user?.name}
                  {isAdmin && (
                    <span className="px-2 py-1 ml-2 text-xs font-semibold text-white bg-red-600 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {getDashboardIcon()}
                  {getDashboardText()}
                </Link>
                
                {/* Lien spécifique pour les admins vers la gestion des entreprises */}
                {isAdmin && (
                  <Link
                    to="/admin/businesses"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Gérer les entreprises
                  </Link>
                )}

                <Link
                  to="/subscription"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mon abonnement
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => setIsMenuOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

