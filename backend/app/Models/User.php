<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
        if (!$this->hasActiveSubscription()) {
            return $this->businesses()->count() < 1; // Gratuit = 1 entreprise
        }

        $plan = $this->currentSubscription->plan;
        return $this->businesses()->count() < $plan->business_limit;
    }

    public function getRemainingBusinessSlots()
    {
        if (!$this->hasActiveSubscription()) {
            return max(0, 1 - $this->businesses()->count());
        }

        $plan = $this->currentSubscription->plan;
        return max(0, $plan->business_limit - $this->businesses()->count());
    }

    public function hasPremiumFeatures()
    {
        return $this->has_premium_features && $this->hasActiveSubscription();
    }
}
