# Guide : Réinitialisation de mot de passe

## 🎯 Fonctionnalité "Mot de passe oublié"

Une solution simple et sécurisée pour permettre aux utilisateurs de réinitialiser leur mot de passe.

## ✨ Fonctionnalités

- ✅ Interface utilisateur moderne et intuitive
- ✅ Envoi d'email automatique avec lien de réinitialisation
- ✅ Validation des mots de passe (minimum 8 caractères)
- ✅ Sécurité : tokens à usage unique avec expiration (60 minutes)
- ✅ Messages d'erreur clairs et utiles
- ✅ Design cohérent avec l'identité visuelle (couleurs #009ee5 et #df0a1e)

## 📱 Pages créées

### 1. Page "Mot de passe oublié" (`/forgot-password`)

- Formulaire simple avec champ email
- Bouton "Envoyer le lien de réinitialisation"
- Lien de retour vers la connexion
- Message de confirmation après envoi

### 2. Page "Nouveau mot de passe" (`/reset-password`)

- Formulaire avec 3 champs : email, nouveau mot de passe, confirmation
- Boutons pour afficher/masquer les mots de passe
- Validation en temps réel
- Message de succès avec redirection automatique

## 🔧 Configuration requise

### Backend (Laravel)

1. **Ajouter dans `.env.local`** :

```env
FRONTEND_URL=http://localhost:5173
MAIL_MAILER=log  # Pour le développement
```

2. **Pour la production, dans `.env.production`** :

```env
FRONTEND_URL=https://pagejaune.cd
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_app
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@pagejaune.cd
```

### Frontend (React)

Aucune configuration supplémentaire ! Les routes sont déjà ajoutées dans `App.jsx`.

## 🚀 Test rapide

### En développement local :

1. Démarrez le backend :

```bash
cd backend
php artisan serve
```

2. Démarrez le frontend :

```bash
cd frontend
npm run dev
```

3. Testez le flux :
   - Allez sur http://localhost:5173/login
   - Cliquez sur "Mot de passe oublié ?"
   - Entrez un email valide d'un utilisateur existant
   - Vérifiez les logs : `backend/storage/logs/laravel.log`
   - Copiez le lien de réinitialisation des logs
   - Collez-le dans le navigateur
   - Réinitialisez le mot de passe

## 📧 Configuration email pour la production

### Option 1 : Gmail (recommandé pour tester)

1. Activez l'authentification à deux facteurs sur votre compte Gmail
2. Générez un "mot de passe d'application" :

   - Allez dans Paramètres > Sécurité > Mots de passe d'application
   - Sélectionnez "Autre" et nommez-le "Pagejaune.cd"
   - Copiez le mot de passe généré

3. Configurez `.env` :

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=le_mot_de_passe_application
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@pagejaune.cd
MAIL_FROM_NAME="Pagejaune.cd"
```

### Option 2 : Service professionnel (recommandé pour la production)

- **SendGrid** : Gratuit jusqu'à 100 emails/jour
- **Mailgun** : Gratuit les 3 premiers mois
- **Amazon SES** : Très bon marché
- **Postmark** : Spécialisé dans les emails transactionnels

### Option 3 : Mailtrap (développement uniquement)

1. Créez un compte sur [mailtrap.io](https://mailtrap.io)
2. Copiez les credentials SMTP
3. Tous les emails seront interceptés et visibles sur Mailtrap

## 🎨 Personnalisation

### Modifier les couleurs

Les couleurs sont déjà configurées :

- Bleu principal : `#009ee5`
- Rouge d'erreur : `#df0a1e`

### Modifier les textes

Éditez les fichiers :

- `frontend/src/pages/ForgotPassword.jsx`
- `frontend/src/pages/ResetPassword.jsx`
- `backend/app/Notifications/ResetPasswordNotification.php`

### Modifier la durée d'expiration

Dans `backend/config/auth.php` :

```php
'passwords' => [
    'users' => [
        'expire' => 60, // minutes (par défaut : 60)
        'throttle' => 60, // secondes entre deux demandes
    ],
],
```

## 🔒 Sécurité

- ✅ Tokens à usage unique
- ✅ Expiration automatique après 60 minutes
- ✅ Limitation des demandes (throttle)
- ✅ Hashage des tokens en base de données
- ✅ Validation stricte des emails et mots de passe
- ✅ Messages d'erreur génériques (pour éviter l'énumération d'emails)

## 🐛 Dépannage

### "Network Error" dans le frontend

- Vérifiez que le backend Laravel est démarré (`php artisan serve`)
- Vérifiez que l'URL dans `frontend/.env.local` est correcte

### Les emails ne sont pas envoyés

- En développement : utilisez `MAIL_MAILER=log` et consultez `storage/logs/laravel.log`
- Vérifiez les credentials SMTP dans `.env`
- Testez avec Mailtrap d'abord

### "Token invalide ou expiré"

- Le token expire après 60 minutes
- Demandez un nouveau lien de réinitialisation

## 📝 Notes importantes

1. **En production** : Utilisez toujours HTTPS pour les liens de réinitialisation
2. **Emails** : Testez d'abord avec Mailtrap ou `log` avant d'utiliser un vrai service SMTP
3. **Base de données** : La table `password_reset_tokens` est déjà créée par les migrations Laravel
4. **Cache** : Après modification du `.env`, n'oubliez pas : `php artisan config:clear`

## ✅ Checklist de déploiement

- [ ] Configurer `FRONTEND_URL` en production
- [ ] Configurer un service SMTP professionnel
- [ ] Tester le flux complet en production
- [ ] Vérifier les emails dans la boîte spam
- [ ] Documenter la procédure pour votre équipe
- [ ] Monitorer les logs pour détecter les problèmes

---

**Besoin d'aide ?** Consultez `backend/RESET_PASSWORD.md` pour plus de détails techniques.

