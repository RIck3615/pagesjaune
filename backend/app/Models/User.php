<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\ResetPasswordNotification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'current_subscription_id',
        'subscription_expires_at',
        'has_premium_features',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'subscription_expires_at' => 'datetime',
        'has_premium_features' => 'boolean',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isBusiness(): bool
    {
        return $this->role === 'business';
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function currentSubscription()
    {
        return $this->belongsTo(UserSubscription::class, 'current_subscription_id');
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function hasActiveSubscription()
    {
        return $this->currentSubscription && $this->currentSubscription->isActive();
    }

    public function canCreateBusiness()
    {
        $currentCount = $this->businesses()->count();

        if (!$this->hasActiveSubscription()) {
            // Plan gratuit : 1 entreprise maximum
            return $currentCount < 1;
        }

        $plan = $this->currentSubscription->plan;

        // Plan Enterprise : illimité
        if ($plan->business_limit === -1) {
            return true;
        }

        // Autres plans : vérifier la limite
        return $currentCount < $plan->business_limit;
    }

    public function getRemainingBusinessSlots()
    {
        $currentCount = $this->businesses()->count();

        if (!$this->hasActiveSubscription()) {
            // Plan gratuit : 1 entreprise maximum
            return max(0, 1 - $currentCount);
        }

        $plan = $this->currentSubscription->plan;

        // Plan Enterprise : illimité
        if ($plan->business_limit === -1) {
            return -1; // -1 signifie illimité
        }

        // Autres plans : calculer les emplacements restants
        return max(0, $plan->business_limit - $currentCount);
    }

    public function getBusinessLimit()
    {
        if (!$this->hasActiveSubscription()) {
            return 1; // Plan gratuit
        }

        $plan = $this->currentSubscription->plan;
        return $plan->business_limit; // -1 pour illimité
    }

    public function hasPremiumFeatures()
    {
        return $this->has_premium_features && $this->hasActiveSubscription();
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token, $this->email));
    }
}
