<?php

use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\Admin\CustomerController as AdminCustomerController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\ProfileController as AdminProfileController;
use App\Http\Controllers\Api\Admin\RoleController as AdminRoleController;
use App\Http\Controllers\Api\Admin\StaffController as AdminStaffController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\CustomerOrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // 1. PUBLIC STOREFRONT ROUTES
    // ==========================================

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Products
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/featured', [ProductController::class, 'featured']);
    Route::get('/products/{slug}', [ProductController::class, 'show']);

    // Coupon validation
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    // Cart (Guest & Authenticated with optional token)
    Route::get('/cart', [CartController::class, 'getCart']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Checkout (Accessible for guests and customers)
    Route::post('/checkout/preview', [CheckoutController::class, 'preview']);
    Route::post('/checkout/payment-intent', [CheckoutController::class, 'createPaymentIntent']);
    Route::post('/checkout/confirm', [CheckoutController::class, 'confirm']);

    // Guest Order Tracking
    Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);

    // ==========================================
    // 2. CUSTOMER AUTHENTICATION & PORTAL
    // ==========================================
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // Authenticated Customer Endpoints
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/cart/merge', [CartController::class, 'mergeGuestCart']);

            // Customer Orders (with strict IDOR protection)
            Route::get('/customer/orders', [CustomerOrderController::class, 'index']);
            Route::get('/customer/orders/{id}', [CustomerOrderController::class, 'show']);
        });
    });

    // ==========================================
    // 3. ADMIN / STAFF AUTHENTICATION
    // ==========================================
    Route::prefix('admin/auth')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login']);

        Route::middleware(['auth:sanctum', 'staff'])->group(function () {
            Route::get('/me', [AdminAuthController::class, 'me']);
            Route::post('/logout', [AdminAuthController::class, 'logout']);
        });
    });

    // ==========================================
    // 4. ADMIN PANEL MANAGEMENT ROUTES (RBAC Protected)
    // ==========================================
    Route::prefix('admin')->middleware(['auth:sanctum', 'staff'])->group(function () {

        // 4.1 Dashboard Analytics
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])
            ->middleware('permission:reports.view');

        // 4.2 Product Management
        Route::middleware('permission:products.view')->group(function () {
            Route::get('/products', [AdminProductController::class, 'index']);
            Route::get('/products/{id}', [AdminProductController::class, 'show']);
        });
        Route::post('/products', [AdminProductController::class, 'store'])
            ->middleware('permission:products.create');
        Route::put('/products/{id}', [AdminProductController::class, 'update'])
            ->middleware('permission:products.edit');
        Route::delete('/products/{id}', [AdminProductController::class, 'destroy'])
            ->middleware('permission:products.delete');
        Route::post('/products/upload-image', [AdminProductController::class, 'uploadImage'])
            ->middleware('permission:products.create');

        // 4.3 Category Management
        Route::get('/categories', [AdminCategoryController::class, 'index'])
            ->middleware('permission:categories.view');
        Route::post('/categories', [AdminCategoryController::class, 'store'])
            ->middleware('permission:categories.manage');
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update'])
            ->middleware('permission:categories.manage');
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy'])
            ->middleware('permission:categories.manage');

        // 4.4 Order Management
        Route::get('/orders', [AdminOrderController::class, 'index'])
            ->middleware('permission:orders.view');
        Route::get('/orders/{id}', [AdminOrderController::class, 'show'])
            ->middleware('permission:orders.view');
        Route::put('/orders/{id}/status', [AdminOrderController::class, 'updateStatus'])
            ->middleware('permission:orders.update_status');

        // 4.5 Coupon Management
        Route::get('/coupons', [AdminCouponController::class, 'index'])
            ->middleware('permission:coupons.view');
        Route::post('/coupons', [AdminCouponController::class, 'store'])
            ->middleware('permission:coupons.manage');
        Route::put('/coupons/{id}', [AdminCouponController::class, 'update'])
            ->middleware('permission:coupons.manage');
        Route::delete('/coupons/{id}', [AdminCouponController::class, 'destroy'])
            ->middleware('permission:coupons.manage');

        // 4.6 Customers Management
        Route::get('/customers', [AdminCustomerController::class, 'index'])
            ->middleware('permission:customers.view');
        Route::get('/customers/{id}', [AdminCustomerController::class, 'show'])
            ->middleware('permission:customers.view');

        // 4.7 Roles & Permissions Matrix
        Route::get('/roles', [AdminRoleController::class, 'index'])
            ->middleware('permission:roles.view');
        Route::get('/permissions', [AdminRoleController::class, 'permissions'])
            ->middleware('permission:roles.view');
        Route::post('/roles', [AdminRoleController::class, 'store'])
            ->middleware('permission:roles.manage');
        Route::put('/roles/{id}', [AdminRoleController::class, 'update'])
            ->middleware('permission:roles.manage');
        Route::delete('/roles/{id}', [AdminRoleController::class, 'destroy'])
            ->middleware('permission:roles.manage');

        // 4.8 Staff Members
        Route::get('/staff', [AdminStaffController::class, 'index'])
            ->middleware('permission:roles.manage');
        Route::post('/staff', [AdminStaffController::class, 'store'])
            ->middleware('permission:roles.manage');
        Route::put('/staff/{id}', [AdminStaffController::class, 'update'])
            ->middleware('permission:roles.manage');

        // 4.9 Staff Personal Profile & Security (Self-service)
        Route::put('/profile', [AdminProfileController::class, 'update']);
        Route::post('/profile/toggle-2fa', [AdminProfileController::class, 'toggle2FA']);
    });
});
