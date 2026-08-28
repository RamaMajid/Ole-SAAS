<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OrganizationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    
    // Public Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Protected Routes (Membutuhkan cookie sesi Sanctum yang valid)
    Route::middleware('auth:sanctum')->group(function () {
        
        Route::prefix('auth')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        // Endpoint Manajemen Organisasi (Tidak butuh header X-Organization-ID)
        Route::apiResource('organizations', OrganizationController::class)->only(['index', 'store', 'show']);

        // ==========================================
        // TENANT-AWARE ROUTES (Rute Spesifik Bisnis)
        // ==========================================
        Route::middleware('tenant')->group(function () {
            
            // Rute uji coba TenantMiddleware
            Route::get('/tenant/status', function () {
                // Jika lolos ke sini, berarti header valid dan user adalah anggota
                $organization = app('tenant');
                return response()->json([
                    'message' => 'Connected to Tenant Context',
                    'active_organization' => $organization->name,
                ]);
            });

        });
    });
});