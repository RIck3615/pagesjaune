<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Business;
use App\Models\Review;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            return $next($request);
        });
    }

    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'total_businesses' => Business::count(),
            'active_businesses' => Business::active()->count(),
            'premium_businesses' => Business::premium()->count(),
            'total_reviews' => Review::count(),
            'pending_reviews' => Review::pending()->count(),
            'approved_reviews' => Review::approved()->count(),
            'total_categories' => Category::count(),
        ];

        $recent_businesses = Business::with(['user', 'categories'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $recent_reviews = Review::with(['business', 'user'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_businesses' => $recent_businesses,
                'recent_reviews' => $recent_reviews,
            ]
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::withCount(['businesses', 'reviews']);

        // Search users
        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filter by role
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        $users = $query->orderBy('created_at', 'desc')
                      ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:users,email,' . $user->id,
            'role' => 'sometimes|required|in:user,business,admin',
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    public function deleteUser(User $user): JsonResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    public function businesses(Request $request): JsonResponse
    {
        $query = Business::with(['user', 'categories']);

        // Search businesses
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by status
        if ($request->has('status')) {
            switch ($request->status) {
                case 'active':
                    $query->active();
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
                case 'verified':
                    $query->verified();
                    break;
                case 'premium':
                    $query->premium();
                    break;
            }
        }

        $businesses = $query->orderBy('created_at', 'desc')
                           ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    public function updateBusiness(Request $request, Business $business): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_verified' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'is_premium' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $business->update($request->all());
        $business->load(['user', 'categories']);

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business
        ]);
    }

    public function reviews(Request $request): JsonResponse
    {
        $query = Review::with(['business', 'user']);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $reviews = $query->orderBy('created_at', 'desc')
                        ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function moderateReview(Request $request, Review $review): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update(['status' => $request->status]);
        $review->load(['business', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Review moderated successfully',
            'data' => $review
        ]);
    }
}

