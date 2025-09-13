<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class AdminController extends Controller
{
    public function __construct()
    {
        // Middleware supprimé pour éviter l'erreur de redirection
    }

    private function checkAuth(Request $request): ?User
    {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }

        // Utiliser Sanctum pour vérifier le token
        $personalAccessToken = PersonalAccessToken::findToken($token);
        if (!$personalAccessToken) {
            return null;
        }

        $user = $personalAccessToken->tokenable;
        if (!$user || !$user->isAdmin()) {
            return null;
        }

        return $user;
    }

    public function getDashboard(Request $request): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $stats = [
                'total_businesses' => Business::count(),
                'active_businesses' => Business::where('is_active', true)->count(),
                'pending_businesses' => Business::where('is_active', false)->count(),
                'premium_businesses' => Business::where('is_premium', true)->count(),
                'verified_businesses' => Business::where('is_verified', true)->count(),
                'total_categories' => Category::count(),
                'total_reviews' => Review::count(),
                'total_users' => User::count(),
            ];

            $recent_businesses = Business::with(['categories', 'user'])
                ->latest()
                ->limit(5)
                ->get();

            $businesses_by_status = Business::select('is_active', DB::raw('count(*) as count'))
                ->groupBy('is_active')
                ->get();

            $businesses_by_premium = Business::select('is_premium', DB::raw('count(*) as count'))
                ->groupBy('is_premium')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'recent_businesses' => $recent_businesses,
                    'businesses_by_status' => $businesses_by_status,
                    'businesses_by_premium' => $businesses_by_premium,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement du tableau de bord',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBusinesses(Request $request): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $status = $request->get('status', 'all');
            $category = $request->get('category', '');
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = Business::with(['categories', 'user']);

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
                });
            }

            if ($status !== 'all') {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                } elseif ($status === 'premium') {
                    $query->where('is_premium', true);
                } elseif ($status === 'verified') {
                    $query->where('is_verified', true);
                }
            }

            if ($category) {
                $query->whereHas('categories', function ($q) use ($category) {
                    $q->where('id', $category);
                });
            }

            $query->orderBy($sortBy, $sortOrder);

            $businesses = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $businesses
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des entreprises',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getBusiness(Request $request, $id): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $business = Business::with(['categories', 'user', 'reviews.user'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $business
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateBusiness(Request $request, $id): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $business = Business::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'email' => 'sometimes|email|max:255',
                'phone' => 'sometimes|string|max:20',
                'website' => 'sometimes|url|max:255',
                'address' => 'sometimes|string|max:500',
                'city' => 'sometimes|string|max:100',
                'province' => 'sometimes|string|max:100',
                'latitude' => 'sometimes|numeric',
                'longitude' => 'sometimes|numeric',
                'is_active' => 'sometimes|boolean',
                'is_premium' => 'sometimes|boolean',
                'is_verified' => 'sometimes|boolean',
                'categories' => 'sometimes|array',
                'categories.*' => 'exists:categories,id',
            ]);

            $business->update($validated);

            if (isset($validated['categories'])) {
                $business->categories()->sync($validated['categories']);
            }

            $business->load(['categories', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Entreprise mise à jour avec succès',
                'data' => $business
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deleteBusiness(Request $request, $id): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $business = Business::findOrFail($id);
            $business->delete();

            return response()->json([
                'success' => true,
                'message' => 'Entreprise supprimée avec succès'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'entreprise',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCategories(Request $request): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $categories = Category::with('parent')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des catégories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getUsers(Request $request): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        try {
            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');

            $query = User::withCount('businesses');

            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du chargement des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

