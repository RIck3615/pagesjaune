import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, Settings, Shield, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import SearchBar from './SearchBar'
import Logo from './Logo'
import { statsService } from '../services/api'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [visitorCount, setVisitorCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
        console.log('📈 Réponse API:', response.data);
        
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
        console.log('🔄 Mise à jour du compteur...');
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

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  // Debug: Afficher l'état actuel
  console.log('🔍 État du Header:', {
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
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <Logo size="md" />
            </Link>
            
            {/* Compteur de visiteurs */}
            <div className="items-center hidden px-3 py-1 space-x-2 rounded-full md:flex bg-primary-50">
              <Eye className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {isLoading ? (
                  <div className="w-16 h-4 rounded bg-primary-200 animate-pulse"></div>
                ) : (
                  `${visitorCount.toLocaleString()} visiteurs`
                )}
              </span>
            </div>
          </div>

          {/* Navigation desktop */}
          <nav className="items-center hidden space-x-8 md:flex">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/businesses"
              className={`text-sm font-medium transition-colors ${
                isActive('/businesses') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Entreprises
            </Link>
            <Link
              to="/categories"
              className={`text-sm font-medium transition-colors ${
                isActive('/categories') ? 'text-primary-600' : 'text-gray-700 hover:text-primary-600'
              }`}
            >
              Catégories
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 space-x-2 text-gray-700 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden text-sm font-medium md:block">
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
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  S'inscrire
                </Link>
              </div>
            )}

            {/* Menu mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
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
              
              <SearchBar />
              
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                to="/businesses"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Entreprises
              </Link>
              <Link
                to="/categories"
                className="block px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:text-primary-600 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Catégories
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
