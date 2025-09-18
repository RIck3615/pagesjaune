import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building2, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Logo from '../components/Logo';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'user'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    if (formData.password !== formData.password_confirmation) {
      setFieldErrors({
        password_confirmation: 'Les mots de passe ne correspondent pas'
      });
      setLoading(false);
      return;
    }

    try {
      const result = await register(formData);
      
      if (result.success) {
        // Rediriger vers la sélection de plan pour les entreprises
        if (formData.role === 'business') {
          navigate('/choose-plan');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Gérer les erreurs de validation du backend
        if (result.status === 422 && result.validationErrors) {
          const formattedErrors = {};
          
          // Formater les erreurs pour l'affichage
          Object.keys(result.validationErrors).forEach(field => {
            if (Array.isArray(result.validationErrors[field])) {
              formattedErrors[field] = result.validationErrors[field][0]; // Prendre le premier message
            } else {
              formattedErrors[field] = result.validationErrors[field];
            }
          });
          
          setFieldErrors(formattedErrors);
        } else {
          setError(result.error || 'Erreur lors de l\'inscription');
        }
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] || '';
  };

  const hasFieldError = (fieldName) => {
    return !!fieldErrors[fieldName];
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="xl" showText={false} variant="icon-only" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Ou{' '}
          <Link
            to="/login"
            className="font-medium hover:opacity-80"
            style={{ color: '#009ee5' }}
          >
            connectez-vous à votre compte existant
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white border border-gray-200 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="px-4 py-3 border rounded-lg" style={{ backgroundColor: '#df0a1e', borderColor: '#df0a1e' }}>
                <p className="text-white">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <div className="relative mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pl-10 placeholder-gray-400 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasFieldError('name') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': hasFieldError('name') ? '#ef4444' : '#009ee5' }}
                  placeholder="Votre nom complet"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {hasFieldError('name') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('name')}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pl-10 placeholder-gray-400 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasFieldError('email') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': hasFieldError('email') ? '#ef4444' : '#009ee5' }}
                  placeholder="votre@email.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              {hasFieldError('email') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('email')}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Type de compte
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasFieldError('role') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': hasFieldError('role') ? '#ef4444' : '#009ee5' }}
                >
                  <option value="user">Utilisateur</option>
                  <option value="business">Entreprise</option>
                </select>
              </div>
              {hasFieldError('role') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('role')}</p>
              )}
              {formData.role === 'business' && (
                <p className="mt-2 text-sm text-blue-600">
                  💡 En tant qu'entreprise, vous pourrez choisir un plan d'abonnement après l'inscription
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pl-10 pr-10 placeholder-gray-400 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasFieldError('password') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': hasFieldError('password') ? '#ef4444' : '#009ee5' }}
                  placeholder="Votre mot de passe"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {hasFieldError('password') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password')}</p>
              )}
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe
              </label>
              <div className="relative mt-1">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pl-10 pr-10 placeholder-gray-400 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent ${
                    hasFieldError('password_confirmation') 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                  style={{ '--tw-ring-color': hasFieldError('password_confirmation') ? '#ef4444' : '#009ee5' }}
                  placeholder="Confirmer votre mot de passe"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {hasFieldError('password_confirmation') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('password_confirmation')}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ backgroundColor: '#009ee5', '--tw-ring-color': '#009ee5' }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                    Inscription...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;