import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminService } from '../services/api'
import { 
  Users, 
  Building2, 
  Star, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  Shield
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('dashboard')

  // Fetch dashboard stats
  const { data: stats } = useQuery(
    'admin-dashboard',
    () => adminService.getDashboard(),
    {
      select: (response) => response.data,
    }
  )

  // Fetch pending reviews
  const { data: pendingReviews } = useQuery(
    'pending-reviews',
    () => adminService.getPendingReviews(),
    {
      select: (response) => response.data.data,
    }
  )

  // Approve review mutation
  const approveReviewMutation = useMutation(
    (reviewId) => adminService.approveReview(reviewId),
    {
      onSuccess: () => {
        toast.success('Avis approuvé avec succès')
        queryClient.invalidateQueries('pending-reviews')
        queryClient.invalidateQueries('admin-dashboard')
      },
      onError: () => {
        toast.error('Erreur lors de l\'approbation')
      }
    }
  )

  // Reject review mutation
  const rejectReviewMutation = useMutation(
    (reviewId) => adminService.rejectReview(reviewId),
    {
      onSuccess: () => {
        toast.success('Avis rejeté avec succès')
        queryClient.invalidateQueries('pending-reviews')
        queryClient.invalidateQueries('admin-dashboard')
      },
      onError: () => {
        toast.error('Erreur lors du rejet')
      }
    }
  )

  const dashboardStats = [
    {
      icon: Users,
      label: 'Utilisateurs',
      value: stats?.total_users || 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: Building2,
      label: 'Entreprises',
      value: stats?.total_businesses || 0,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: Star,
      label: 'Avis en attente',
      value: stats?.pending_reviews || 0,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      icon: Shield,
      label: 'Entreprises vérifiées',
      value: stats?.verified_businesses || 0,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'reviews', label: 'Modération des avis', icon: Star },
  ]

  const handleApproveReview = (reviewId) => {
    approveReviewMutation.mutate(reviewId)
  }

  const handleRejectReview = (reviewId) => {
    rejectReviewMutation.mutate(reviewId)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Administration
        </h1>
        <p className="text-gray-600">
          Gérez la plateforme et modérez le contenu
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Actions rapides
            </h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span>Gérer les utilisateurs</span>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span>Gérer les entreprises</span>
                  <Building2 className="w-5 h-5 text-gray-400" />
                </div>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <span>Modérer les avis</span>
                  <Star className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Activité récente
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">3 nouvelles entreprises ajoutées</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">5 avis en attente de modération</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">2 nouveaux utilisateurs</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Avis en attente de modération ({pendingReviews?.data?.length || 0})
          </h2>
          
          {pendingReviews?.data?.length > 0 ? (
            <div className="space-y-4">
              {pendingReviews.data.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-sm">
                            {review.user?.name?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{review.user?.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {review.comment && (
                        <p className="text-gray-700 mb-3">{review.comment}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Entreprise: {review.business?.name}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        disabled={approveReviewMutation.isLoading}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approuver</span>
                      </button>
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        disabled={rejectReviewMutation.isLoading}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeter</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun avis en attente
              </h3>
              <p className="text-gray-500">
                Tous les avis ont été modérés
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
