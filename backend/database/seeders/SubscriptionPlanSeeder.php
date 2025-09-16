<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Gratuit',
                'slug' => 'free',
                'description' => 'Plan gratuit pour commencer',
                'price' => 0.00,
                'currency' => 'USD',
                'business_limit' => 1,
                'duration_days' => 365,
                'features' => [
                    '1 entreprise',
                    'Profil de base',
                    'Contact limité'
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'description' => 'Parfait pour les petites entreprises',
                'price' => 5.00,
                'currency' => 'USD',
                'business_limit' => 2,
                'duration_days' => 30,
                'features' => [
                    '2 entreprises',
                    'Mise en avant',
                    'Analytics de base',
                    'Chat illimité',
                    'Support prioritaire'
                ],
                'is_active' => true,
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Professional',
                'slug' => 'professional',
                'description' => 'Pour les entreprises en croissance',
                'price' => 15.00,
                'currency' => 'USD',
                'business_limit' => 5,
                'duration_days' => 30,
                'features' => [
                    '5 entreprises',
                    'Mise en avant premium',
                    'Analytics avancés',
                    'Chat illimité',
                    'Support prioritaire',
                    'Statistiques détaillées'
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'description' => 'Pour les grandes entreprises',
                'price' => 50.00,
                'currency' => 'USD',
                'business_limit' => -1, // Illimité
                'duration_days' => 30,
                'features' => [
                    'Entreprises illimitées',
                    'Mise en avant premium',
                    'Analytics complets',
                    'Chat illimité',
                    'Support 24/7',
                    'API personnalisée',
                    'Intégrations avancées'
                ],
                'is_active' => true,
                'is_popular' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}
