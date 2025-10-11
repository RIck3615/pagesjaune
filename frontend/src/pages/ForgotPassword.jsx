import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Logo from '../components/Logo';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await api.post('/password/forgot', { email });
      
      if (response.data.success) {
        setSuccess(true);
        setEmail('');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue. Veuillez réessayer.'
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
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe.
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
                E-mail envoyé !
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Si un compte existe avec cette adresse e-mail, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: '#009ee5' }}
                >
                  Retour à la connexion
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Envoyer un autre e-mail
                </button>
              </div>
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
                <div className="relative mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 pl-10 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': '#009ee5' }}
                    placeholder="votre@email.com"
                  />
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
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
                      Envoi en cours...
                    </div>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center text-sm font-medium hover:opacity-80"
                  style={{ color: '#009ee5' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
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

export default ForgotPassword;

