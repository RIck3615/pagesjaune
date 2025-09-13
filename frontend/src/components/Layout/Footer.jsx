import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-white" style={{ backgroundColor: '#d6ac34' }}>
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4 space-x-2">
              <Building2 className="w-8 h-8 text-white" />
              <span className="text-xl font-bold text-white">PagesJaunes.cd</span>
            </div>
            <p className="mb-4 text-sm text-white/90">
              Votre annuaire d'entreprises de référence en République Démocratique du Congo. 
              Trouvez et découvrez les meilleures entreprises locales.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm transition-colors text-white/80 hover:text-white">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm transition-colors text-white/80 hover:text-white">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/register?type=business" className="text-sm transition-colors text-white/80 hover:text-white">
                  Inscrire mon entreprise
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm transition-colors text-white/80 hover:text-white">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories populaires */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=restaurants" className="text-sm transition-colors text-white/80 hover:text-white">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/search?category=hotels" className="text-sm transition-colors text-white/80 hover:text-white">
                  Hôtels
                </Link>
              </li>
              <li>
                <Link to="/search?category=medecins" className="text-sm transition-colors text-white/80 hover:text-white">
                  Médecins
                </Link>
              </li>
              <li>
                <Link to="/search?category=avocats" className="text-sm transition-colors text-white/80 hover:text-white">
                  Avocats
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">
                  Kinshasa, République Démocratique du Congo
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">
                  +243 123 456 789
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">
                  contact@pagesjaunes.cd
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="pt-8 mt-8 border-t border-white/20">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-white/80">
              © 2024 PagesJaunes.cd. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm transition-colors text-white/80 hover:text-white">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="text-sm transition-colors text-white/80 hover:text-white">
                Conditions d'utilisation
              </Link>
              <Link to="/about" className="text-sm transition-colors text-white/80 hover:text-white">
                À propos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
