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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isBusiness, setIsBusiness] = useState(false)

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('auth_user')
      
      console.log('Initialisation auth:', { token: !!token, userData: !!userData })
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData)
          console.log('Utilisateur chargé depuis localStorage:', parsedUser)
          setUser(parsedUser)
          setIsAuthenticated(true)
          setIsAdmin(parsedUser.role === 'admin')
          setIsBusiness(parsedUser.role === 'business')
        } catch (parseError) {
          console.error('Erreur parsing user data:', parseError)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          setUser(null)
          setIsAuthenticated(false)
          setIsAdmin(false)
          setIsBusiness(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        setIsBusiness(false)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      // Gérer différentes structures de réponse
      let userData, token
      if (response.data.data) {
        // Structure: { success: true, data: { user, token } }
        userData = response.data.data.user
        token = response.data.data.token
      } else if (response.data.user) {
        // Structure: { user, token }
        userData = response.data.user
        token = response.data.token
      } else {
        throw new Error('Format de réponse inattendu')
      }
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Mettre à jour tous les états
      setUser(userData)
      setIsAuthenticated(true)
      setIsAdmin(userData.role === 'admin')
      setIsBusiness(userData.role === 'business')
      
      toast.success('Connexion réussie !')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur de connexion'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      // Gérer différentes structures de réponse
      let newUser, token
      if (response.data.data) {
        newUser = response.data.data.user
        token = response.data.data.token
      } else if (response.data.user) {
        newUser = response.data.user
        token = response.data.token
      } else {
        throw new Error('Format de réponse inattendu')
      }
      
      localStorage.setItem('auth_token', token)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
      setUser(newUser)
      
      toast.success('Inscription réussie !')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Erreur d\'inscription'
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
      setIsAuthenticated(false)
      setIsAdmin(false)
      setIsBusiness(false)
      toast.success('Déconnexion réussie !')
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isBusiness,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
