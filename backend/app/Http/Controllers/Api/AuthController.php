<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    use ApiResponseTrait;

    /**
     * Customer Registration
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email:rfc,dns', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'name' => strip_tags($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $token = $user->createToken('customer-auth-token')->plainTextToken;

        ActivityLog::log('CUSTOMER_REGISTER', "New customer registered: {$user->email}", $user);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'token' => $token,
        ], 'Registration successful', 201);
    }

    /**
     * Customer Login (with rate-limiting & generic error message)
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $throttleKey = Str::transliterate(Str::lower($request->input('email')).'|'.$request->ip());

        // Max 5 attempts per minute
        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);
            return $this->errorResponse(
                "Too many login attempts. Please try again in {$seconds} seconds.",
                429
            );
        }

        $user = User::where('email', strtolower(trim($request->input('email'))))->first();

        // Generic error message - never reveal if email or password was wrong
        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, 60);
            return $this->errorResponse('Invalid credentials provided.', 401);
        }

        if (!$user->is_active) {
            return $this->errorResponse('Your account is deactivated. Please contact support.', 403);
        }

        // Clear rate limiter on success
        RateLimiter::clear($throttleKey);

        $token = $user->createToken('customer-auth-token')->plainTextToken;

        ActivityLog::log('CUSTOMER_LOGIN', "Customer logged in: {$user->email}", $user);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
            'token' => $token,
        ], 'Login successful');
    }

    /**
     * Get Current Authenticated Customer
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Customer Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Forgot Password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', strtolower(trim($request->email)))->first();

        // Even if user not found, return generic success message to prevent user enumeration!
        if ($user) {
            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            // Log or send reset link email
            ActivityLog::log('PASSWORD_RESET_REQUESTED', "Reset requested for: {$user->email}", $user);
        }

        return $this->successResponse(
            null,
            'If your email exists in our system, you will receive a password reset link shortly.'
        );
    }

    /**
     * Reset Password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', strtolower(trim($request->email)))
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return $this->errorResponse('Invalid or expired reset token.', 400);
        }

        $user = User::where('email', $record->email)->first();
        if (!$user) {
            return $this->errorResponse('User not found.', 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return $this->successResponse(null, 'Password has been reset successfully.');
    }
}

