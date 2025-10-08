<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\StatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public business routes
    Route::get('/businesses', [BusinessController::class, 'index']);
    Route::get('/businesses/{business}', [BusinessController::class, 'show']);
    Route::get('/businesses/{business}/reviews', [BusinessController::class, 'getReviews']);
    Route::get('/autocomplete', [BusinessController::class, 'autocomplete']);

    // Public category routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/tree', [CategoryController::class, 'tree']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Public review routes (only approved reviews)
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::post('/reviews', [ReviewController::class, 'store'])->middleware('auth:sanctum');
    Route::get('/reviews/{review}', [ReviewController::class, 'show']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy'])->middleware('auth:sanctum');
    Route::get('/my-reviews', [ReviewController::class, 'myReviews'])->middleware('auth:sanctum');

    // Public subscription plans
    Route::get('/subscription-plans', [SubscriptionController::class, 'getPlans']);

    // Nouvelle route pour vérifier les limites
    Route::get('/business-limits', [BusinessController::class, 'checkLimits'])->middleware('auth:sanctum');

    // Routes des statistiques (DÉPLACÉES ICI)
    Route::prefix('stats')->group(function () {
        Route::post('/visitors', [StatsController::class, 'recordVisit']);
        Route::get('/visitors/today', [StatsController::class, 'getTodayCount']);
        Route::get('/visitors/total', [StatsController::class, 'getTotalCount']);
        Route::get('/visitors/weekly', [StatsController::class, 'getWeeklyStats']);
    });

    // Admin routes (SANS middleware auth:sanctum)
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'getDashboard']);
        Route::get('/businesses', [AdminController::class, 'getBusinesses']);
        Route::get('/businesses/{business}', [AdminController::class, 'getBusiness']);
        Route::put('/businesses/{business}', [AdminController::class, 'updateBusiness']);
        Route::delete('/businesses/{business}', [AdminController::class, 'deleteBusiness']);

        // User management
        Route::get('/users', [AdminController::class, 'getUsers']);

        // Category management
        Route::get('/categories', [AdminController::class, 'getCategories']);

        // Review management
        Route::get('/reviews', [AdminController::class, 'getReviews']);
        Route::put('/reviews/{review}/moderate', [AdminController::class, 'moderateReview']);

        // Business approval
        Route::put('/businesses/{business}/approve', [AdminController::class, 'approveBusiness']);
        Route::put('/businesses/{business}/reject', [AdminController::class, 'rejectBusiness']);
    });

    // User business routes (AVEC middleware auth:sanctum)
    Route::get('/my-businesses', [BusinessController::class, 'getMyBusinesses'])->middleware('auth:sanctum');
    Route::post('/businesses', [BusinessController::class, 'store'])->middleware('auth:sanctum');
    Route::post('/businesses/{business}', [BusinessController::class, 'update'])->middleware('auth:sanctum'); // Accepter POST
    Route::put('/businesses/{business}', [BusinessController::class, 'update'])->middleware('auth:sanctum'); // Garder PUT pour JSON
    Route::delete('/businesses/{business}', [BusinessController::class, 'destroy'])->middleware('auth:sanctum');
});

// Protected routes (avec middleware auth:sanctum)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    // User routes
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Review routes
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);

    // Subscription routes
    Route::get('/my-subscription', [SubscriptionController::class, 'getCurrentSubscription']);
    Route::post('/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('/cancel-subscription', [SubscriptionController::class, 'cancelSubscription']);
    Route::get('/payment-history', [SubscriptionController::class, 'getPaymentHistory']);
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/stats', [AdminController::class, 'getStats']);
    Route::get('/admin/businesses', [AdminController::class, 'getBusinesses']);
    Route::get('/admin/users', [AdminController::class, 'getUsers']);
    Route::get('/admin/reviews', [AdminController::class, 'getReviews']);
    Route::put('/admin/reviews/{review}/moderate', [AdminController::class, 'moderateReview']);
    Route::put('/admin/businesses/{business}/approve', [AdminController::class, 'approveBusiness']);
    Route::put('/admin/businesses/{business}/reject', [AdminController::class, 'rejectBusiness']);
});

// Recherche par proximité
Route::get('/businesses/proximity', [BusinessController::class, 'searchByProximity']);
