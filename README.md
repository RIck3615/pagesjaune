# PagesJaunes.cd - Annuaire Professionnel de la RDC

Une application web complète d'annuaire professionnel pour la République Démocratique du Congo, construite avec Laravel (backend) et React (frontend).

## 🚀 Fonctionnalités

### Pour les utilisateurs

- **Recherche avancée** : Trouvez facilement des entreprises par nom, catégorie, ville ou province
- **Filtres intelligents** : Filtrez par catégorie, ville, statut vérifié ou premium
- **Détails complets** : Pages détaillées avec informations de contact, horaires, photos et avis
- **Système d'avis** : Laissez des avis et consultez ceux des autres utilisateurs
- **Interface responsive** : Optimisée pour mobile, tablette et desktop

### Pour les entreprises

- **Gestion de fiches** : Créez et gérez vos fiches d'entreprise
- **Tableau de bord** : Suivez vos performances et statistiques
- **Abonnement Premium** : Augmentez votre visibilité avec des fonctionnalités premium
- **Gestion des avis** : Suivez et répondez aux avis clients

### Pour les administrateurs

- **Modération** : Gérez les entreprises et modérez les avis
- **Gestion des utilisateurs** : Administrez les comptes utilisateurs
- **Statistiques** : Tableau de bord avec métriques détaillées
- **Gestion des catégories** : Organisez les secteurs d'activité

## 🛠️ Technologies

### Backend

- **Laravel 12** : Framework PHP moderne
- **Laravel Sanctum** : Authentification API
- **MySQL** : Base de données
- **Eloquent ORM** : Gestion des données

### Frontend

- **React 18** : Interface utilisateur moderne
- **Vite** : Build tool rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **React Router** : Navigation SPA
- **Axios** : Client HTTP
- **React Query** : Gestion d'état serveur

## 📋 Prérequis

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0+
- Git

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd pagejaunes.cd
```

### 2. Configuration Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données MySQL dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pagejaunes_cd
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe_mysql

# Créer la base de données MySQL
mysql -u root -p -e "CREATE DATABASE pagejaunes_cd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Exécuter les migrations
php artisan migrate

# Peupler la base de données
php artisan db:seed

# Créer le lien symbolique pour le stockage
php artisan storage:link

# Démarrer le serveur
php artisan serve
```

### 3. Configuration Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Créer le fichier d'environnement
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local

# Démarrer le serveur de développement
npm run dev
```

### 4. Accès à l'application

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000/api/v1
- **Admin Laravel** : http://localhost:8000

## 👥 Comptes de test

L'application inclut des comptes de test pré-configurés :

- **Admin** : `admin@pagesjaunes.cd` / `password`
- **Entreprise** : `business@pagesjaunes.cd` / `password`
- **Utilisateur** : `user@pagesjaunes.cd` / `password`

## 📁 Structure du projet

```
pagejaunes.cd/
├── backend/                 # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/  # Contrôleurs API
│   │   └── Models/               # Modèles Eloquent
│   ├── database/
│   │   ├── migrations/          # Migrations de base de données
│   │   └── seeders/            # Données de test
│   └── routes/api.php          # Routes API
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/         # Composants réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── services/          # Services API
│   │   └── utils/             # Utilitaires
│   └── public/
└── README.md
```

## 🔧 Configuration avancée

### Variables d'environnement Backend (.env)

```env
APP_NAME="PagesJaunes.cd"
APP_URL=http://localhost:8000
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pagejaunes_cd
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173,127.0.0.1:5173
```

### Variables d'environnement Frontend (.env.local)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME="PagesJaunes.cd"
VITE_APP_URL=http://localhost:5173
```

## 🚀 Déploiement

### Déploiement sur VPS (NGINX + PHP-FPM)

1. **Préparer le serveur**

```bash
# Installer NGINX, PHP-FPM, MySQL
sudo apt update
sudo apt install nginx php8.2-fpm mysql-server

# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. **Configurer NGINX**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/pagejaunes.cd/frontend/dist;
    index index.html;

    # Frontend React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Laravel
    location /api {
        alias /var/www/pagejaunes.cd/backend/public;
        try_files $uri $uri/ @laravel;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }

    location @laravel {
        rewrite /api/(.*)$ /api/index.php last;
    }
}
```

3. **Déployer l'application**

```bash
# Cloner et configurer
git clone <repository-url> /var/www/pagejaunes.cd
cd /var/www/pagejaunes.cd

# Backend
cd backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force

# Frontend
cd ../frontend
npm install
npm run build
```

### Déploiement sur Render/DigitalOcean

1. **Backend (Render)**

   - Connecter le repository GitHub
   - Build Command : `cd backend && composer install && php artisan migrate --force`
   - Start Command : `cd backend && php artisan serve --host=0.0.0.0 --port=$PORT`

2. **Frontend (Vercel/Netlify)**
   - Connecter le repository GitHub
   - Build Command : `cd frontend && npm install && npm run build`
   - Publish Directory : `frontend/dist`

## 🧪 Tests

### Backend

```bash
cd backend
php artisan test
```

### Frontend

```bash
cd frontend
npm test
```

## 📊 Base de données

### Tables principales

- `users` : Utilisateurs (admin, business, user)
- `businesses` : Fiches d'entreprises
- `categories` : Catégories d'activité (hiérarchiques)
- `business_category` : Relation N↔N entreprises-catégories
- `reviews` : Avis et notations

### Relations

- User → Businesses (1:N)
- Business → Categories (N:N)
- Business → Reviews (1:N)
- User → Reviews (1:N)

## 🔐 Sécurité

- **Authentification** : Laravel Sanctum avec tokens
- **Validation** : Validation stricte des données
- **CORS** : Configuration appropriée pour les requêtes cross-origin
- **Sanitisation** : Échappement des données utilisateur
- **Autorisation** : Middleware de protection des routes

## 🎨 Personnalisation

### Couleurs et thème

Modifiez les couleurs dans `frontend/tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#your-color",
        secondary: "#your-color",
      },
    },
  },
};
```

### Catégories par défaut

Modifiez `backend/database/seeders/CategorySeeder.php` pour ajouter vos catégories.

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :

- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :

- 📧 Email : support@pagesjaunes.cd
- 🐛 Issues : GitHub Issues
- 📖 Documentation : Wiki du projet

## 🎯 Roadmap

### Phase 1 (MVP) ✅

- [x] Authentification utilisateurs
- [x] CRUD entreprises
- [x] Système de catégories
- [x] Recherche et filtrage
- [x] Système d'avis
- [x] Tableau de bord admin

### Phase 2 (À venir)

- [ ] Paiements Stripe/PayPal
- [ ] Abonnements premium
- [ ] Notifications push
- [ ] API mobile
- [ ] Analytics avancées
- [ ] Intégration Google Maps
- [ ] Chat en direct
- [ ] Système de réservation

---

**PagesJaunes.cd** - L'annuaire professionnel de la République Démocratique du Congo 🇨🇩
