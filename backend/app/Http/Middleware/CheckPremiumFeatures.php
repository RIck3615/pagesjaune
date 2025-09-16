<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckPremiumFeatures
{
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        if (!$user || !$user->hasPremiumFeatures()) {
            return response()->json([
                'success' => false,
                'message' => 'Fonctionnalité premium requise. Veuillez améliorer votre abonnement.',
                'requires_subscription' => true
            ], 403);
        }

        return $next($request);
    }
}
