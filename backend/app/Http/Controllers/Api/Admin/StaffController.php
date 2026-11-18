<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class StaffController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all staff members with assigned roles
     */
    public function index(): JsonResponse
    {
        $staff = User::whereHas('roles')
            ->with('roles')
            ->get();

        return $this->successResponse($staff, 'Staff members retrieved');
    }

    /**
     * Create staff member
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['required', Password::min(8)->mixedCase()->numbers()],
            'role_ids' => ['required', 'array', 'min:1'],
            'role_ids.*' => ['exists:roles,id'],
        ]);

        $user = User::create([
            'name' => strip_tags($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $user->roles()->sync($validated['role_ids']);

        ActivityLog::log('STAFF_CREATED', "New staff member added: {$user->email}", $request->user());

        return $this->successResponse($user->load('roles'), 'Staff member created successfully', 201);
    }

    /**
     * Update staff member roles or status
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isSuperAdmin() && $request->user()->id !== $user->id) {
            return $this->errorResponse('Super Admin account cannot be modified by other users.', 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
            'role_ids' => ['sometimes', 'array', 'min:1'],
            'role_ids.*' => ['exists:roles,id'],
            'password' => ['nullable', Password::min(8)->mixedCase()->numbers()],
        ]);

        $user->name = strip_tags($validated['name']);
        $user->phone = $validated['phone'] ?? $user->phone;

        if (isset($validated['is_active']) && !$user->isSuperAdmin()) {
            $user->is_active = $validated['is_active'];
        }

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        if (isset($validated['role_ids']) && !$user->isSuperAdmin()) {
            $user->roles()->sync($validated['role_ids']);
        }

        ActivityLog::log('STAFF_UPDATED', "Staff member updated: {$user->email}", $request->user());

        return $this->successResponse($user->fresh('roles'), 'Staff member updated');
    }
}

