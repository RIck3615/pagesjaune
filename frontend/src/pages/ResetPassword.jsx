import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email');

  const [formData, setFormData] = useState({
    email: emailParam || '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide ou expiré.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/password/reset', {
        token,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response.data.success) {
        setSuccess(true);
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue. Le lien est peut-être expiré.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Logo size="xl" showText={false} variant="icon-only" />
        </div>
        <h2 className="mt-6 text-3xl font-bold text-center text-gray-900">
          Nouveau mot de passe
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Entrez votre nouveau mot de passe ci-dessous.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-4 py-8 bg-white border border-gray-200 shadow-lg sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16" style={{ color: '#009ee5' }} />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Mot de passe réinitialisé !
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
              </p>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#009ee5' }}
              >
                Se connecter maintenant
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div 
                  className="px-4 py-3 border rounded-lg" 
                  style={{ backgroundColor: '#fef2f2', borderColor: '#df0a1e', color: '#df0a1e' }}
                >
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Adresse e-mail
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#009ee5' }}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
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
                    className="block w-full px-3 py-2 pl-10 pr-10 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#009ee5' }}
                    placeholder="Minimum 8 caractères"
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
                    className="block w-full px-3 py-2 pl-10 pr-10 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#009ee5' }}
                    placeholder="Confirmez votre mot de passe"
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
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg group focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: '#009ee5', '--tw-ring-color': '#009ee5' }}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                      Réinitialisation...
                    </div>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="text-sm font-medium hover:opacity-80"
                  style={{ color: '#009ee5' }}
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

