import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-gradient">
                <span className="text-lg font-bold text-white">PJ</span>
              </div>
              <span className="text-xl font-bold">PagesJaunes.cd</span>
            </div>
            <p className="mb-4 text-gray-300">
              L'annuaire professionnel de la République Démocratique du Congo. 
              Trouvez facilement les entreprises et services dont vous avez besoin.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 transition-colors hover:text-primary-400">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary-400">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 transition-colors hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 transition-colors hover:text-white">
                  Recherche
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-300 transition-colors hover:text-white">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 transition-colors hover:text-white">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary-400">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-gray-300 transition-colors hover:text-white">
                  Inscription entreprise
                </Link>
              </li>
              <li>
                <Link to="/premium" className="text-gray-300 transition-colors hover:text-white">
                  Abonnement Premium
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-gray-300 transition-colors hover:text-white">
                  Aide
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-gray-800">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 PagesJaunes.cd. Tous droits réservés.
            </p>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <Link to="/privacy" className="text-sm text-gray-400 transition-colors hover:text-white">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-sm text-gray-400 transition-colors hover:text-white">
                Conditions d'utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
