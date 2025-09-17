import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, User, LogOut, Settings, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'
import SearchBar from './SearchBar'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setIsUserMenuOpen(false)
  }

  const isHomePage = location.pathname === '/'

  // Déterminer le lien du tableau de bord selon le rôle
  const dashboardLink = isAdmin ? '/admin/dashboard' : '/dashboard'
  
  // Déterminer le lien du logo selon le rôle
  const logoLink = isAdmin ? '/admin/dashboard' : '/'

  // Debug temporaire
  console.log('Header Debug:', { 
    isAdmin, 
    userRole: user?.role, 
    dashboardLink,
    isAuthenticated 
  })

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Redirige vers admin dashboard si admin, sinon vers accueil */}
          <Link to={logoLink} className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="text-xl font-bold text-gray-900">PagesJaunes CD</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          {isHomePage && (
            <div className="flex-1 hidden max-w-2xl mx-8 md:flex">
              <SearchBar />
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-6 md:flex">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <User className="w-5 h-5" />
                  <span>{user?.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 z-50 w-48 py-1 mt-2 bg-white rounded-md shadow-lg">
                    <Link
                      to={dashboardLink}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isAdmin ? 'Tableau de bord Admin' : 'Tableau de bord'}
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Administration
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                  className="font-medium text-gray-700 hover:text-gray-900"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-400 rounded-md md:hidden hover:text-gray-500 hover:bg-gray-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        {isHomePage && (
          <div className="pb-4 md:hidden">
            <SearchBar />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="py-4 border-t border-gray-200 md:hidden">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <Link
                  to={dashboardLink}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="inline w-4 h-4 mr-2" />
                  {isAdmin ? 'Tableau de bord Admin' : 'Tableau de bord'}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield className="inline w-4 h-4 mr-2" />
                    Administration
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
