<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class BusinessController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Business::with(['categories', 'user'])
            ->active()
            ->verified();

        // Search
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->inCategory($request->category_id);
        }

        // Filter by city
        if ($request->has('city') && $request->city) {
            $query->inCity($request->city);
        }

        // Filter by province
        if ($request->has('province') && $request->province) {
            $query->where('province', 'like', "%{$request->province}%");
        }

        // Sort by premium first, then by rating
        $query->orderBy('is_premium', 'desc')
              ->orderBy('average_rating', 'desc')
              ->orderBy('created_at', 'desc');

        $perPage = $request->get('per_page', 15);
        $businesses = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    public function show(Business $business): JsonResponse
    {
        $business->load(['categories', 'user', 'approvedReviews.user']);

        return response()->json([
            'success' => true,
            'data' => $business
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'required|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'required|string|max:500',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'nullable|array',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['logo', 'images', 'category_ids']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('businesses/logos', 'public');
        }

        // Handle images upload
        if ($request->hasFile('images')) {
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('businesses/images', 'public');
            }
            $data['images'] = $images;
        }

        $data['user_id'] = $request->user()->id;
        $business = Business::create($data);

        // Attach categories
        $business->categories()->attach($request->category_ids);

        $business->load(['categories', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Business created successfully',
            'data' => $business
        ], 201);
    }

    public function update(Request $request, Business $business): JsonResponse
    {
        // Check if user owns this business or is admin
        if ($business->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'sometimes|required|string|max:20',
            'website' => 'nullable|url|max:255',
            'address' => 'sometimes|required|string|max:500',
            'city' => 'sometimes|required|string|max:100',
            'province' => 'sometimes|required|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'opening_hours' => 'nullable|array',
            'category_ids' => 'sometimes|array|min:1',
            'category_ids.*' => 'exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['logo', 'images', 'category_ids']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($business->logo) {
                Storage::disk('public')->delete($business->logo);
            }
            $data['logo'] = $request->file('logo')->store('businesses/logos', 'public');
        }

        // Handle images upload
        if ($request->hasFile('images')) {
            // Delete old images
            if ($business->images) {
                foreach ($business->images as $image) {
                    Storage::disk('public')->delete($image);
                }
            }
            $images = [];
            foreach ($request->file('images') as $image) {
                $images[] = $image->store('businesses/images', 'public');
            }
            $data['images'] = $images;
        }

        $business->update($data);

        // Update categories if provided
        if ($request->has('category_ids')) {
            $business->categories()->sync($request->category_ids);
        }

        $business->load(['categories', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business
        ]);
    }

    public function destroy(Request $request, Business $business): JsonResponse
    {
        // Check if user owns this business or is admin
        if ($business->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
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
            'message' => 'Business deleted successfully'
        ]);
    }

    public function myBusinesses(Request $request): JsonResponse
    {
        $businesses = $request->user()->businesses()
            ->with(['categories'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }
}

