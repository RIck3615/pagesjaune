<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class SubscriptionController extends Controller
{
    public function getPlans()
    {
        try {
            $plans = SubscriptionPlan::active()
                ->ordered()
                ->get();

            return response()->json([
                'success' => true,
                'data' => $plans
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des plans: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des plans'
            ], 500);
        }
    }

    public function getCurrentSubscription()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non authentifié'
                ], 401);
            }

            $subscription = $user->currentSubscription;

            if (!$subscription) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'Aucun abonnement actif'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'subscription' => $subscription->load('plan'),
                    'is_active' => $subscription->isActive(),
                    'days_remaining' => $subscription->daysRemaining(),
                    'remaining_business_slots' => $user->getRemainingBusinessSlots()
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération de l\'abonnement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'abonnement'
            ], 500);
        }
    }

    public function subscribe(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
            'payment_method' => 'required|in:stripe,paypal,mobile_money,free', // Ajouter 'free'
        ]);

        $user = Auth::user();
        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Vérifier si l'utilisateur peut s'abonner
        if ($user->hasActiveSubscription()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà un abonnement actif'
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Créer l'abonnement
            $subscription = UserSubscription::create([
                'user_id' => $user->id,
                'subscription_plan_id' => $plan->id,
                'status' => $plan->price == 0 ? 'active' : 'pending', // Activer directement si gratuit
                'starts_at' => now(),
                'expires_at' => now()->addDays($plan->duration_days),
                'amount_paid' => $plan->price,
                'currency' => $plan->currency,
                'payment_method' => $request->payment_method,
                'auto_renew' => $plan->price > 0, // Pas de renouvellement automatique pour le gratuit
            ]);

            // Si c'est un plan gratuit, l'activer directement
            if ($plan->price == 0) {
                // Mettre à jour l'utilisateur directement
                $user->update([
                    'current_subscription_id' => $subscription->id,
                    'subscription_expires_at' => $subscription->expires_at,
                    'has_premium_features' => false, // Le plan gratuit n'a pas de fonctionnalités premium
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Plan gratuit activé avec succès',
                    'data' => [
                        'subscription' => $subscription->load('plan')
                    ]
                ]);
            }

            // Pour les plans payants, continuer avec le processus de paiement
            $payment = Payment::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'payment_method' => $request->payment_method,
                'external_id' => 'temp_' . time(),
                'amount' => $plan->price,
                'currency' => $plan->currency,
                'status' => 'pending',
            ]);

            // Traiter le paiement selon la méthode
            $paymentResult = $this->processPayment($payment, $request->payment_method);

            if ($paymentResult['success']) {
                $subscription->update([
                    'status' => 'active',
                    'payment_reference' => $paymentResult['reference'],
                    'payment_details' => $paymentResult['details'],
                ]);

                $payment->update([
                    'status' => 'completed',
                    'external_id' => $paymentResult['reference'],
                    'payment_data' => $paymentResult['details'],
                    'processed_at' => now(),
                ]);

                // Mettre à jour l'utilisateur
                $user->update([
                    'current_subscription_id' => $subscription->id,
                    'subscription_expires_at' => $subscription->expires_at,
                    'has_premium_features' => true,
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Abonnement activé avec succès',
                    'data' => [
                        'subscription' => $subscription->load('plan'),
                        'payment' => $payment
                    ]
                ]);
            } else {
                $payment->update([
                    'status' => 'failed',
                    'failure_reason' => $paymentResult['error'],
                ]);

                DB::rollback();

                return response()->json([
                    'success' => false,
                    'message' => 'Échec du paiement: ' . $paymentResult['error']
                ], 400);
            }

        } catch (\Exception $e) {
            DB::rollback();
            \Log::error('Erreur lors de la création de l\'abonnement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de l\'abonnement'
            ], 500);
        }
    }

    public function cancelSubscription()
    {
        try {
            $user = Auth::user();
            $subscription = $user->currentSubscription;

            if (!$subscription || !$subscription->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Aucun abonnement actif à annuler'
                ], 400);
            }

            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'auto_renew' => false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Abonnement annulé avec succès'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'annulation de l\'abonnement: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'annulation de l\'abonnement'
            ], 500);
        }
    }

    public function getPaymentHistory()
    {
        try {
            $user = Auth::user();
            $payments = $user->payments()
                ->with('subscription.plan')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $payments
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération de l\'historique des paiements: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'historique des paiements'
            ], 500);
        }
    }

    private function processPayment(Payment $payment, string $method)
    {
        switch ($method) {
            case 'stripe':
                return $this->processStripePayment($payment);
            case 'paypal':
                return $this->processPayPalPayment($payment);
            case 'mobile_money':
                return $this->processMobileMoneyPayment($payment);
            default:
                return ['success' => false, 'error' => 'Méthode de paiement non supportée'];
        }
    }

    private function processStripePayment(Payment $payment)
    {
        // TODO: Implémenter l'intégration Stripe
        // Pour l'instant, simulation d'un paiement réussi
        return [
            'success' => true,
            'reference' => 'stripe_' . time(),
            'details' => ['method' => 'stripe', 'amount' => $payment->amount]
        ];
    }

    private function processPayPalPayment(Payment $payment)
    {
        // TODO: Implémenter l'intégration PayPal
        return [
            'success' => true,
            'reference' => 'paypal_' . time(),
            'details' => ['method' => 'paypal', 'amount' => $payment->amount]
        ];
    }

    private function processMobileMoneyPayment(Payment $payment)
    {
        // TODO: Implémenter l'intégration Mobile Money
        return [
            'success' => true,
            'reference' => 'mobile_money_' . time(),
            'details' => ['method' => 'mobile_money', 'amount' => $payment->amount]
        ];
    }
}
