<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AdminAuthController extends Controller
{
    use ApiResponseTrait;

    /**
     * Staff/Admin Login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = 'admin_login_'.Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->errorResponse(
                "Too many login attempts. Please try again in {$seconds} seconds.",
                429
            );
        }

        $user = User::with(['roles.permissions'])->where('email', strtolower(trim($request->input('email'))))->first();

        // Generic error message if invalid credentials or not a staff member
        if (!$user || !Hash::check($request->input('password'), $user->password) || $user->roles->isEmpty()) {
            RateLimiter::hit($throttleKey, 60);
            return $this->errorResponse('Invalid credentials or unauthorized staff account.', 401);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Your administrative access has been suspended.', 403);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('admin-auth-token', ['staff'])->plainTextToken;

        ActivityLog::log('ADMIN_LOGIN', "Staff member logged in: {$user->email}", $user);

        $roles = $user->roles->pluck('name', 'slug')->toArray();
        $permissions = $user->isSuperAdmin()
            ? ['*']
            : $user->allPermissions()->pluck('slug')->values()->toArray();

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'is_super_admin' => $user->isSuperAdmin(),
                'roles' => $roles,
                'permissions' => $permissions,
            ],
            'token' => $token,
        ], 'Admin login successful');
    }

    /**
     * Get Current Authenticated Staff with Roles & Permissions
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user()->load('roles.permissions');

        $roles = $user->roles->pluck('name', 'slug')->toArray();
        $permissions = $user->isSuperAdmin()
            ? ['*']
            : $user->allPermissions()->pluck('slug')->values()->toArray();

        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'is_super_admin' => $user->isSuperAdmin(),
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Staff Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Staff session ended.');
    }
}

