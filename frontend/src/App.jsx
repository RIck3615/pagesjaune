import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Auth
import { AuthProvider } from './hooks/useAuth';

// Layout components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Route components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import BusinessDetails from './pages/BusinessDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBusinesses from './pages/MyBusinesses';
import CreateBusiness from './pages/CreateBusiness';
import EditBusiness from './pages/EditBusiness';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminBusinesses from './pages/Admin/AdminBusinesses';

// Components for reviews
import ReviewList from './components/Review/ReviewList';
import ReviewCard from './components/Review/ReviewCard';
import ReviewForm from './components/Review/ReviewForm';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            
            <main className="flex-1">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/business/:id" element={<BusinessDetails />} />
                
                {/* Public routes that redirect if authenticated */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/my-businesses" element={
                  <ProtectedRoute>
                    <MyBusinesses />
                  </ProtectedRoute>
                } />
                <Route path="/business/new" element={
                  <ProtectedRoute>
                    <CreateBusiness />
                  </ProtectedRoute>
                } />
                <Route path="/business/:id/edit" element={
                  <ProtectedRoute>
                    <EditBusiness />
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/businesses" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminBusinesses />
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="*" element={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
                      <p className="mb-6 text-gray-600">Page non trouvée</p>
                      <a
                        href="/"
                        className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Retour à l'accueil
                      </a>
                    </div>
                  </div>
                } />
              </Routes>
            </main>
            
            <Footer />
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;