<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Visitor;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    /**
     * Enregistrer une visite
     */
    public function recordVisit(Request $request): JsonResponse
    {
        try {
            $ipAddress = $request->ip();
            $userAgent = $request->userAgent();

            // Optionnel : géolocalisation
            $country = $request->input('country');
            $city = $request->input('city');

            $visitor = Visitor::recordVisit($ipAddress, $userAgent, $country, $city);

            return response()->json([
                'success' => true,
                'message' => 'Visite enregistrée',
                'data' => [
                    'visitor_id' => $visitor->id,
                    'is_new' => $visitor->wasRecentlyCreated
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'enregistrement de la visite',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le nombre de visiteurs d'aujourd'hui
     */
    public function getTodayCount(): JsonResponse
    {
        try {
            $count = Visitor::getTodayCount();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count,
                    'date' => now()->toDateString()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir le nombre total de visiteurs
     */
    public function getTotalCount(): JsonResponse
    {
        try {
            $count = Visitor::getTotalCount();

            return response()->json([
                'success' => true,
                'data' => [
                    'count' => $count
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtenir les statistiques des 7 derniers jours
     */
    public function getWeeklyStats(): JsonResponse
    {
        try {
            $stats = Visitor::getWeeklyStats();

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
