<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\SubscriptionPlan; // Ajout de l'import
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    private function checkAuth(Request $request): ?\App\Models\User
    {
        $token = $request->bearerToken();
        if (!$token) {
            return null;
        }

        $personalAccessToken = PersonalAccessToken::findToken($token);
        if (!$personalAccessToken) {
            return null;
        }

        return $personalAccessToken->tokenable;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Business::with(['categories', 'user']);

        // Filter by active status (default to active only)
        if ($request->has('active')) {
            if ($request->active === 'true' || $request->active === true) {
                $query->active();
            } elseif ($request->active === 'false' || $request->active === false) {
                $query->where('is_active', false);
            }
        } else {
            // Par défaut, afficher seulement les entreprises actives
            $query->active();
        }

        // Filter by verified status - Par défaut, afficher seulement les entreprises vérifiées
        if ($request->has('verified')) {
            if ($request->verified === 'true' || $request->verified === true) {
                $query->verified();
            } elseif ($request->verified === 'false' || $request->verified === false) {
                $query->where('is_verified', false);
            }
        } else {
            // Par défaut, afficher seulement les entreprises vérifiées
            $query->verified();
        }

        // Filter by premium status
        if ($request->has('premium')) {
            if ($request->premium === 'true' || $request->premium === true) {
                $query->premium();
            } elseif ($request->premium === 'false' || $request->premium === false) {
                $query->where('is_premium', false);
            }
        }

        // Recherche améliorée avec scoring
        if ($request->has('search') && $request->search) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                // Recherche exacte (priorité maximale)
                $q->where('name', 'like', "{$searchTerm}")
                  // Recherche qui commence par le terme (haute priorité)
                  ->orWhere('name', 'like', "{$searchTerm}%")
                  // Recherche dans le nom (priorité moyenne)
                  ->orWhere('name', 'like', "%{$searchTerm}%")
                  // Recherche dans la description
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  // Recherche dans l'adresse
                  ->orWhere('address', 'like', "%{$searchTerm}%")
                  // Recherche dans les catégories
                  ->orWhereHas('categories', function ($catQuery) use ($searchTerm) {
                      $catQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by category name - Optimisé avec cache
        if ($request->has('category') && $request->category) {
            $categoryId = Category::where('name', 'like', "%{$request->category}%")
                ->orWhere('slug', 'like', "%{$request->category}%")
                ->pluck('id');

            if ($categoryId->isNotEmpty()) {
                $query->whereHas('categories', function ($q) use ($categoryId) {
                    $q->whereIn('category_id', $categoryId);
                });
            } else {
                // Si aucune catégorie trouvée, retourner un résultat vide
                $query->whereRaw('1 = 0');
            }
        }

        // Filter by category_id
        if ($request->has('category_id') && $request->category_id) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Filter by city - Recherche insensible à la casse
        if ($request->has('city') && $request->city) {
            $query->whereRaw('LOWER(city) LIKE ?', ['%' . strtolower($request->city) . '%']);
        }

        // Filter by province - Recherche insensible à la casse
        if ($request->has('province') && $request->province) {
            $query->whereRaw('LOWER(province) LIKE ?', ['%' . strtolower($request->province) . '%']);
        }

        // Filter by rating - Optimisé avec sous-requête
        if ($request->has('rating') && $request->rating) {
            $query->whereHas('approvedReviews', function ($q) use ($request) {
                $q->selectRaw('AVG(rating) as avg_rating')
                  ->havingRaw('AVG(rating) >= ?', [$request->rating]);
            });
        }

        // Tri optimisé : Premium d'abord, puis par pertinence de recherche, puis par date
        $query->orderBy('is_premium', 'desc');

        // Si recherche, trier par pertinence
        if ($request->has('search') && $request->search) {
            $searchTerm = trim($request->search);
            $query->orderByRaw("
                CASE
                    WHEN name = ? THEN 1
                    WHEN name LIKE ? THEN 2
                    WHEN name LIKE ? THEN 3
                    ELSE 4
                END
            ", [$searchTerm, "{$searchTerm}%", "%{$searchTerm}%"]);
        }

        $query->orderBy('created_at', 'desc');

        // Pagination optimisée
        $perPage = min($request->get('per_page', 15), 50); // Limite max à 50
        $businesses = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    public function show($id): JsonResponse
    {
        $business = Business::with(['categories', 'user', 'reviews.user'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Entreprise non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $business
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Vérifier les limites d'abonnement
        if (!$user->canCreateBusiness()) {
            // Récupérer les plans supérieurs suggérés
            $currentLimit = $user->hasActiveSubscription()
                ? $user->currentSubscription->plan->business_limit
                : 1;

            $suggestedPlans = SubscriptionPlan::active()
                ->where('business_limit', '>', $currentLimit)
                ->orWhere('business_limit', -1) // Inclure les plans illimités
                ->orderBy('price')
                ->limit(3)
                ->get();

            return response()->json([
                'success' => false,
                'message' => 'Limite d\'entreprises atteinte. Veuillez améliorer votre abonnement.',
                'error_type' => 'business_limit_reached',
                'remaining_slots' => $user->getRemainingBusinessSlots(),
                'requires_subscription' => true,
                'current_limit' => $currentLimit,
                'current_count' => $user->businesses()->count(),
                'current_plan' => $user->hasActiveSubscription()
                    ? $user->currentSubscription->plan
                    : null,
                'suggested_plans' => $suggestedPlans,
                'upgrade_benefits' => [
                    'Créez plus d\'entreprises',
                    'Augmentez votre visibilité',
                    'Accédez aux statistiques avancées',
                    'Support prioritaire'
                ]
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'nullable|array',
            'opening_hours.*.day' => 'required|string',
            'opening_hours.*.is_open' => 'required|boolean',
            'opening_hours.*.open_time' => 'nullable|string',
            'opening_hours.*.close_time' => 'nullable|string',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['logo', 'images', 'category_ids']);
        $data['user_id'] = $user->id;
        $data['is_active'] = true;
        $data['is_verified'] = false;

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('businesses/logos', 'public');
            $data['logo'] = $logoPath;
        }

        // Handle images upload
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('businesses/images', 'public');
            }
            $data['images'] = $imagePaths;
        }

        $business = Business::create($data);

        // Attach categories
        $business->categories()->attach($request->category_ids);

        return response()->json([
            'success' => true,
            'message' => 'Entreprise créée avec succès',
            'data' => $business->load('categories')
        ], 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        $business = Business::findOrFail($id);

        // Check if user owns this business
        if ($business->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'sometimes|required|string|max:500',
            'city' => 'sometimes|required|string|max:100',
            'province' => 'sometimes|required|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'existing_images.*' => 'nullable|string',
            'images_to_delete.*' => 'nullable|string',
            'opening_hours' => 'nullable|array',
            'opening_hours.*.day' => 'required|string',
            'opening_hours.*.is_open' => 'required|boolean',
            'opening_hours.*.open_time' => 'nullable|string',
            'opening_hours.*.close_time' => 'nullable|string',
            'category_ids' => 'sometimes|required|array|min:1',
            'category_ids.*' => 'exists:categories,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['logo', 'images', 'category_ids', 'existing_images', 'images_to_delete']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($business->logo) {
                Storage::disk('public')->delete($business->logo);
            }
            $logoPath = $request->file('logo')->store('businesses/logos', 'public');
            $data['logo'] = $logoPath;
        }

        // Handle images update
        $allImages = [];

        // Ajouter les images existantes à conserver
        if ($request->has('existing_images') && is_array($request->existing_images)) {
            $allImages = array_merge($allImages, $request->existing_images);
        }

        // Ajouter les nouvelles images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $allImages[] = $image->store('businesses/images', 'public');
            }
        }

        // Supprimer les images marquées pour suppression
        if ($request->has('images_to_delete') && is_array($request->images_to_delete)) {
            foreach ($request->images_to_delete as $imagePath) {
                if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                    Storage::disk('public')->delete($imagePath);
                }
            }
        }

        // Mettre à jour le champ images seulement si nécessaire
        if (!empty($allImages) || $request->hasFile('images') || $request->has('existing_images') || $request->has('images_to_delete')) {
            $data['images'] = $allImages;
        }

        $business->update($data);

        // Update categories
        if ($request->has('category_ids')) {
            $business->categories()->sync($request->category_ids);
        }

        return response()->json([
            'success' => true,
            'message' => 'Entreprise mise à jour avec succès',
            'data' => $business->load('categories')
        ]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        $business = Business::findOrFail($id);

        // Check if user owns this business
        if ($business->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        // Delete associated files
        if ($business->logo) {
            Storage::disk('public')->delete($business->logo);
        }

        if ($business->images) {
            foreach ($business->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $business->delete();

        return response()->json([
            'success' => true,
            'message' => 'Entreprise supprimée avec succès'
        ]);
    }

    public function getMyBusinesses(Request $request): JsonResponse
    {
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        $businesses = Business::with(['categories'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $query = $request->get('q', '');
        $type = $request->get('type', 'business');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        $suggestions = [];

        switch ($type) {
            case 'business':
                $suggestions = Business::active()
                    ->verified()
                    ->where(function($q) use ($query) {
                        $q->where('name', 'like', "{$query}%")
                          ->orWhere('name', 'like', "%{$query}%");
                    })
                    ->select('name')
                    ->distinct()
                    ->orderByRaw("
                        CASE
                            WHEN name = ? THEN 1
                            WHEN name LIKE ? THEN 2
                            ELSE 3
                        END
                    ", [$query, "{$query}%"])
                    ->limit(10)
                    ->pluck('name')
                    ->toArray();
                break;

            case 'category':
                $suggestions = Category::active()
                    ->where(function($q) use ($query) {
                        $q->where('name', 'like', "{$query}%")
                          ->orWhere('name', 'like', "%{$query}%");
                    })
                    ->select('name')
                    ->distinct()
                    ->orderByRaw("
                        CASE
                            WHEN name = ? THEN 1
                            WHEN name LIKE ? THEN 2
                            ELSE 3
                        END
                    ", [$query, "{$query}%"])
                    ->limit(10)
                    ->pluck('name')
                    ->toArray();
                break;

            case 'location':
                $suggestions = Business::active()
                    ->verified()
                    ->where(function($q) use ($query) {
                        $q->where('city', 'like', "{$query}%")
                          ->orWhere('city', 'like', "%{$query}%")
                          ->orWhere('province', 'like', "{$query}%")
                          ->orWhere('province', 'like', "%{$query}%");
                    })
                    ->select('city', 'province')
                    ->distinct()
                    ->orderByRaw("
                        CASE
                            WHEN city = ? THEN 1
                            WHEN city LIKE ? THEN 2
                            WHEN province = ? THEN 3
                            WHEN province LIKE ? THEN 4
                            ELSE 5
                        END
                    ", [$query, "{$query}%", $query, "{$query}%"])
                    ->limit(10)
                    ->get()
                    ->map(function($item) {
                        return [
                            'city' => $item->city,
                            'province' => $item->province,
                            'display' => $item->city . ($item->province ? ', ' . $item->province : '')
                        ];
                    })
                    ->toArray();
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $suggestions
        ]);
    }

    public function getReviews(Request $request, Business $business): JsonResponse
    {
        $reviews = $business->reviews()
            ->with(['user'])
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function searchByProximity(Request $request): JsonResponse
    {
        $query = Business::with(['categories', 'user']);

        // Filter by active and verified status
        $query->active()->verified();

        // Recherche textuelle
        if ($request->has('search') && $request->search) {
            $searchTerm = trim($request->search);
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "{$searchTerm}")
                  ->orWhere('name', 'like', "{$searchTerm}%")
                  ->orWhere('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('address', 'like', "%{$searchTerm}%")
                  ->orWhereHas('categories', function ($catQuery) use ($searchTerm) {
                      $catQuery->where('name', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Filter by location
        if ($request->has('location') && $request->location) {
            $location = trim($request->location);
            $query->where(function ($q) use ($location) {
                $q->where('city', 'like', "%{$location}%")
                  ->orWhere('province', 'like', "%{$location}%")
                  ->orWhere('address', 'like', "%{$location}%");
            });
        }

        // Filter by category
        if ($request->has('category') && $request->category) {
            $categoryId = Category::where('name', 'like', "%{$request->category}%")
                ->orWhere('slug', 'like', "%{$request->category}%")
                ->pluck('id');

            if ($categoryId->isNotEmpty()) {
                $query->whereHas('categories', function ($q) use ($categoryId) {
                    $q->whereIn('category_id', $categoryId);
                });
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        // Recherche par proximité géographique
        if ($request->has('latitude') && $request->has('longitude')) {
            $latitude = (float) $request->latitude;
            $longitude = (float) $request->longitude;
            $radius = (float) $request->get('radius', 10); // Rayon par défaut de 10 km

            // Utiliser la formule de Haversine pour calculer la distance
            $query->selectRaw("
                *,
                (6371 * acos(
                    cos(radians(?)) *
                    cos(radians(latitude)) *
                    cos(radians(longitude) - radians(?)) +
                    sin(radians(?)) *
                    sin(radians(latitude))
                )) AS distance
            ", [$latitude, $longitude, $latitude])
            ->having('distance', '<=', $radius)
            ->orderBy('distance');

            // Filtrer seulement les entreprises avec des coordonnées GPS
            $query->whereNotNull('latitude')
                  ->whereNotNull('longitude')
                  ->where('latitude', '!=', 0)
                  ->where('longitude', '!=', 0);
        } else {
            // Tri par défaut si pas de géolocalisation
            $query->orderBy('is_premium', 'desc')
                  ->orderBy('created_at', 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 100);
        $businesses = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    // Nouvelle méthode pour vérifier les limites avant la création
    public function checkLimits(Request $request): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $canCreate = $user->canCreateBusiness();
        $currentCount = $user->businesses()->count();
        $currentLimit = $user->getBusinessLimit();
        $remainingSlots = $user->getRemainingBusinessSlots();

        $response = [
            'success' => true,
            'can_create' => $canCreate,
            'current_count' => $currentCount,
            'current_limit' => $currentLimit,
            'remaining_slots' => $remainingSlots,
            'current_plan' => $user->hasActiveSubscription()
                ? $user->currentSubscription->plan
                : null
        ];

        // Si la limite est atteinte, ajouter les plans suggérés
        if (!$canCreate) {
            $suggestedPlans = SubscriptionPlan::active()
                ->where('business_limit', '>', $currentLimit)
                ->orWhere('business_limit', -1)
                ->orderBy('price')
                ->limit(3)
                ->get();

            $response['suggested_plans'] = $suggestedPlans;
            $response['upgrade_message'] = "Vous avez atteint votre limite de {$currentLimit} entreprise" .
                ($currentLimit > 1 ? 's' : '') . ". Améliorez votre plan pour en créer plus.";
        }

        return response()->json($response);
    }
}

