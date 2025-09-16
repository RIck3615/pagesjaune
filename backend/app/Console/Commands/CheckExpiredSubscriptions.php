<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserSubscription;
use App\Models\User;

class CheckExpiredSubscriptions extends Command
{
    protected $signature = 'subscriptions:check-expired';
    protected $description = 'Vérifier et désactiver les abonnements expirés';

    public function handle()
    {
        $expiredSubscriptions = UserSubscription::where('status', 'active')
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($expiredSubscriptions as $subscription) {
            $subscription->update(['status' => 'expired']);

            $user = $subscription->user;
            $user->update([
                'has_premium_features' => false,
                'subscription_expires_at' => null,
            ]);

            $this->info("Abonnement expiré pour l'utilisateur {$user->email}");
        }

        $this->info("Vérification terminée. {$expiredSubscriptions->count()} abonnements expirés.");
    }
}
