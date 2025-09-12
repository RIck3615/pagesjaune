import { useState, useEffect, useContext, createContext } from 'react'
import { authService } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('auth_user')
      
      if (token && userData) {
        try {
          const response = await authService.me()
          setUser(response.data.user)
        } catch (error) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      const { user: userData, token } = response.data
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      setUser(userData)
      
      toast.success('Connexion réussie !')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur de connexion'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      const { user: newUser, token } = response.data
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      setUser(newUser)
      
      toast.success('Inscription réussie !')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur d\'inscription'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      setUser(null)
      toast.success('Déconnexion réussie !')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isBusiness: user?.role === 'business',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
