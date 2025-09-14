<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AdminController;

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

    // Public category routes
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/tree', [CategoryController::class, 'tree']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Public review routes (only approved reviews)
    Route::get('/reviews', [ReviewController::class, 'index']);
    Route::get('/reviews/{review}', [ReviewController::class, 'show']);

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
    });

    // User business routes (SANS middleware auth:sanctum)
    Route::get('/my-businesses', [BusinessController::class, 'getMyBusinesses']);
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::post('/businesses/{business}', [BusinessController::class, 'update']); // Accepter POST
    Route::put('/businesses/{business}', [BusinessController::class, 'update']); // Garder PUT pour JSON
    Route::delete('/businesses/{business}', [BusinessController::class, 'destroy']);
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
});

