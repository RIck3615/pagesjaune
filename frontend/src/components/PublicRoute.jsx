import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, isBusiness, loading, user } = useAuth()

  console.log('PublicRoute - État:', { 
    loading, 
    isAuthenticated, 
    isAdmin, 
    isBusiness, 
    user: user?.name,
    role: user?.role 
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-32 h-32 border-b-2 rounded-full animate-spin border-primary-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    console.log('Utilisateur connecté, redirection vers dashboard approprié')
    // Rediriger selon le rôle de l'utilisateur connecté
    if (isAdmin) {
      return <Navigate to="/admin/dashboard" replace />
    } else if (isBusiness) {
      return <Navigate to="/my-businesses" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  console.log('Utilisateur non connecté, affichage de la page publique')
  return children
}

export default PublicRoute
