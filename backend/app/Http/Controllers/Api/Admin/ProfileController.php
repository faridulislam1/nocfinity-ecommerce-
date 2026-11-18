<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    use ApiResponseTrait;

    /**
     * Update current staff profile
     */
    public function update(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'current_password' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'confirmed', Password::min(8)->mixedCase()->numbers()],
        ]);

        if (!empty($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return $this->errorResponse('Your current password does not match.', 422);
            }
            $user->password = Hash::make($validated['password']);
        }

        $user->name = strip_tags($validated['name']);
        $user->phone = $validated['phone'] ?? $user->phone;
        $user->save();

        ActivityLog::log('PROFILE_UPDATED', "User {$user->email} updated profile settings", $user);

        return $this->successResponse([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
        ], 'Profile updated successfully');
    }

    /**
     * Toggle 2FA Status (Bonus feature)
     */
    public function toggle2FA(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if ($user->two_factor_confirmed_at) {
            $user->two_factor_confirmed_at = null;
            $user->two_factor_secret = null;
            $user->save();
            ActivityLog::log('2FA_DISABLED', "2FA disabled for {$user->email}", $user);
            return $this->successResponse(['two_factor_enabled' => false], '2FA disabled.');
        } else {
            $user->two_factor_secret = Str::random(32);
            $user->two_factor_confirmed_at = now();
            $user->save();
            ActivityLog::log('2FA_ENABLED', "2FA enabled for {$user->email}", $user);
            return $this->successResponse(['two_factor_enabled' => true], '2FA enabled successfully.');
        }
    }
}

