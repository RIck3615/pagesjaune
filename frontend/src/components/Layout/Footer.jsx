import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from '../Logo';

const Footer = () => {
  return (
    <footer className="text-black" style={{ backgroundColor: '#fbb040' }}>
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Logo size="lg" />
            </div>
            <p className="mb-4 text-sm text-black/90">
              Votre annuaire d'entreprises de référence en République Démocratique du Congo. 
              Trouvez et découvrez les meilleures entreprises locales.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="transition-colors text-black/80 hover:text-black">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-black/80 hover:text-black">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-black/80 hover:text-black">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="transition-colors text-black/80 hover:text-black">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-black">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm transition-colors text-black/80 hover:text-black">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm transition-colors text-black/80 hover:text-black">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/register?type=business" className="text-sm transition-colors text-black/80 hover:text-black">
                  Inscrire mon entreprise
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm transition-colors text-black/80 hover:text-black">
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Catégories populaires */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-black">Catégories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search?category=restaurants" className="text-sm transition-colors text-black/80 hover:text-black">
                  Restaurants
                </Link>
              </li>
              <li>
                <Link to="/search?category=hotels" className="text-sm transition-colors text-black/80 hover:text-black">
                  Hôtels
                </Link>
              </li>
              <li>
                <Link to="/search?category=medecins" className="text-sm transition-colors text-black/80 hover:text-black">
                  Médecins
                </Link>
              </li>
              <li>
                <Link to="/search?category=avocats" className="text-sm transition-colors text-black/80 hover:text-black">
                  Avocats
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-black">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-black/80" />
                <span className="text-sm text-black/80">
                  Kinshasa, République Démocratique du Congo
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-black/80" />
                <span className="text-sm text-black/80">
                  +243 819 378 784
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-black/80" />
                <span className="text-sm text-black/80">
                  contact@pagejaune.cd
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="pt-8 mt-8 border-t border-black/20">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <div className="text-sm text-black/80">
              © 2025 PageJaune.cd. Tous droits réservés.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm transition-colors text-black/80 hover:text-black">
                Politique de confidentialité
              </Link>
              <Link to="/terms" className="text-sm transition-colors text-black/80 hover:text-black">
                Conditions d'utilisation
              </Link>
              <Link to="/about" className="text-sm transition-colors text-black/80 hover:text-black">
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
