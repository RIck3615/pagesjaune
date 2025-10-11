# Réinitialisation de mot de passe - Documentation

## Fonctionnalités implémentées

✅ Page "Mot de passe oublié" pour demander la réinitialisation  
✅ Page de réinitialisation avec token  
✅ Routes API Laravel pour gérer la réinitialisation  
✅ Envoi d'email avec lien de réinitialisation  
✅ Validation des tokens et expiration (60 minutes)  
✅ Notifications email personnalisées

## Configuration

### 1. Variables d'environnement

Ajoutez ces variables dans votre fichier `.env` :

```env
# URL du frontend (pour les liens dans les emails)
FRONTEND_URL=http://localhost:5173

# Configuration mail (exemple avec Mailtrap pour le développement)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=votre_username
MAIL_PASSWORD=votre_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@pagejaune.cd
MAIL_FROM_NAME="${APP_NAME}"
```

### 2. Configuration de production

Pour la production, modifiez `.env.production` :

```env
FRONTEND_URL=https://pagejaune.cd
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com  # ou votre fournisseur SMTP
MAIL_PORT=587
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@pagejaune.cd
MAIL_FROM_NAME="Pagejaune.cd"
```

## Utilisation

### Flux utilisateur

1. **Demander la réinitialisation** :

    - L'utilisateur clique sur "Mot de passe oublié ?" sur la page de connexion
    - Il entre son adresse e-mail
    - Il reçoit un email avec un lien de réinitialisation

2. **Réinitialiser le mot de passe** :
    - L'utilisateur clique sur le lien dans l'email
    - Il est redirigé vers `/reset-password?token=xxx&email=xxx`
    - Il entre son nouveau mot de passe (minimum 8 caractères)
    - Il confirme le mot de passe
    - Il est redirigé vers la page de connexion

### Routes API

#### POST `/api/v1/password/forgot`

Demander un lien de réinitialisation

**Requête** :

```json
{
    "email": "utilisateur@example.com"
}
```

**Réponse** :

```json
{
    "success": true,
    "message": "Un lien de réinitialisation a été envoyé à votre adresse e-mail."
}
```

#### POST `/api/v1/password/reset`

Réinitialiser le mot de passe

**Requête** :

```json
{
    "token": "token_from_email",
    "email": "utilisateur@example.com",
    "password": "nouveau_mot_de_passe",
    "password_confirmation": "nouveau_mot_de_passe"
}
```

**Réponse** :

```json
{
    "success": true,
    "message": "Votre mot de passe a été réinitialisé avec succès."
}
```

#### POST `/api/v1/password/check-token`

Vérifier si un token est valide

**Requête** :

```json
{
    "token": "token_from_email",
    "email": "utilisateur@example.com"
}
```

**Réponse** :

```json
{
    "success": true,
    "valid": true,
    "message": "Token valide."
}
```

## Sécurité

-   ✅ Les tokens expirent après 60 minutes
-   ✅ Un utilisateur ne peut demander qu'un token par minute (throttle)
-   ✅ Les mots de passe doivent contenir au moins 8 caractères
-   ✅ Les tokens sont hashés en base de données
-   ✅ Les emails sont validés avant l'envoi

## Test en développement

### Avec Mailtrap

1. Créez un compte sur [Mailtrap.io](https://mailtrap.io)
2. Copiez vos credentials SMTP dans `.env`
3. Testez la fonctionnalité
4. Consultez les emails interceptés sur Mailtrap

### Avec log

Pour tester sans configurer SMTP, utilisez le driver `log` :

```env
MAIL_MAILER=log
```

Les emails seront écrits dans `storage/logs/laravel.log`.

## Personnalisation

### Modifier le template d'email

Éditez le fichier :

```
app/Notifications/ResetPasswordNotification.php
```

### Modifier la durée d'expiration

Dans `config/auth.php` :

```php
'passwords' => [
    'users' => [
        'provider' => 'users',
        'table' => 'password_reset_tokens',
        'expire' => 60, // En minutes
        'throttle' => 60, // Délai entre deux demandes
    ],
],
```

## Dépannage

### Les emails ne sont pas envoyés

1. Vérifiez la configuration SMTP dans `.env`
2. Testez avec `MAIL_MAILER=log` pour voir les logs
3. Vérifiez les logs : `storage/logs/laravel.log`
4. Assurez-vous que la queue est en cours d'exécution si vous utilisez des queues

### Le lien de réinitialisation ne fonctionne pas

1. Vérifiez que `FRONTEND_URL` est correctement configuré dans `.env`
2. Vérifiez que le token n'est pas expiré (60 minutes)
3. Vérifiez les logs pour les erreurs

### "Token invalide ou expiré"

1. Le token expire après 60 minutes
2. Un token ne peut être utilisé qu'une seule fois
3. Demandez un nouveau lien de réinitialisation
