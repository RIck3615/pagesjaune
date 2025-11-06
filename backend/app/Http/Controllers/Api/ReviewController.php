<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['business', 'user']);

        // Filter by business
        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        // Filter by status (admin only)
        if ($request->user() && $request->user()->isAdmin()) {
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } else {
            // Non-admin users only see approved reviews
            $query->approved();
        }

        $reviews = $query->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    public function show(Review $review): JsonResponse
    {
        $review->load(['business', 'user']);

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if user already reviewed this business
        $existingReview = Review::where('business_id', $request->business_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this business'
            ], 422);
        }

        $review = Review::create([
            'business_id' => $request->business_id,
            'user_id' => $request->user()->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending', // All reviews need moderation
        ]);

        $review->load(['business', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully. It will be published after moderation.',
            'data' => $review
        ], 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        // Check if user owns this review or is admin
        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'status' => 'sometimes|required|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Only admins can change status
        if ($request->has('status') && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can change review status'
            ], 403);
        }

        $review->update($request->all());
        $review->load(['business', 'user']);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review
        ]);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        // Check if user owns this review or is admin
        if ($review->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $review->delete();

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    public function moderate(Request $request, Review $review): JsonResponse
    {
        // Only admins can moderate reviews
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

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

    public function myReviews(Request $request): JsonResponse
    {
        $reviews = Review::where('user_id', $request->user()->id)
            ->with(['business'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }
}
