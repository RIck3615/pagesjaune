<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

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

        // Search
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by category name - Trouver d'abord l'ID de la catégorie
        if ($request->has('category') && $request->category) {
            \Log::info('Recherche par catégorie:', ['category' => $request->category]);

            $categoryId = Category::where('name', 'like', "%{$request->category}%")->pluck('id');
            \Log::info('IDs de catégories trouvés:', ['category_ids' => $categoryId->toArray()]);

            if ($categoryId->isNotEmpty()) {
                $query->whereHas('categories', function ($q) use ($categoryId) {
                    $q->whereIn('category_id', $categoryId);
                });
                \Log::info('Filtre par catégorie appliqué');
            } else {
                // Si aucune catégorie trouvée, retourner un résultat vide
                $query->whereRaw('1 = 0');
                \Log::info('Aucune catégorie trouvée, résultat vide');
            }
        }

        // Filter by category_id
        if ($request->has('category_id') && $request->category_id) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('category_id', $request->category_id);
            });
        }

        // Filter by city
        if ($request->has('city') && $request->city) {
            $query->inCity($request->city);
        }

        // Filter by province
        if ($request->has('province') && $request->province) {
            $query->where('province', 'like', "%{$request->province}%");
        }

        // Filter by rating - Utiliser une sous-requête pour calculer la note moyenne
        if ($request->has('rating') && $request->rating) {
            $query->whereHas('approvedReviews', function ($q) use ($request) {
                $q->selectRaw('AVG(rating) as avg_rating')
                  ->havingRaw('AVG(rating) >= ?', [$request->rating]);
            });
        }

        // Sort by premium first, then by created_at
        $query->orderBy('is_premium', 'desc')
              ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 15);
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
        $user = $this->checkAuth($request);
        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
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

        // DEBUG: Log les données reçues
        \Log::info('=== DEBUG UPDATE BUSINESS ===', [
            'business_id' => $id,
            'method' => $request->method(),
            'content_type' => $request->header('Content-Type'),
            'request_data' => $request->all(),
            'files' => $request->file(),
            'existing_images' => $request->get('existing_images'),
            'images_to_delete' => $request->get('images_to_delete'),
            'form_data_keys' => array_keys($request->all()),
            'has_form_data' => $request->isMethod('POST') || $request->isMethod('PUT'),
        ]);

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

        // DEBUG: Log les données avant traitement
        \Log::info('=== DONNÉES AVANT TRAITEMENT ===', [
            'data' => $data,
            'has_logo' => $request->hasFile('logo'),
            'has_images' => $request->hasFile('images'),
            'existing_images_count' => count($request->get('existing_images', [])),
            'images_to_delete_count' => count($request->get('images_to_delete', []))
        ]);

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
}

