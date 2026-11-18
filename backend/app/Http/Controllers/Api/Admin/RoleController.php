<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    use ApiResponseTrait;

    /**
     * Get all roles with their assigned permissions
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->get();

        return $this->successResponse($roles, 'Roles retrieved');
    }

    /**
     * Get all available granular permissions grouped by domain for Matrix UI
     */
    public function permissions(): JsonResponse
    {
        $permissions = Permission::all()->groupBy('group');
        return $this->successResponse($permissions, 'Permissions matrix retrieved');
    }

    /**
     * Store new custom role with permissions
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:roles,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'permission_ids' => ['required', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => strip_tags($validated['name']),
            'slug' => Str::slug($validated['name']),
            'description' => isset($validated['description']) ? strip_tags($validated['description']) : null,
            'is_system' => false,
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        ActivityLog::log('ROLE_CREATED', "Role created: {$role->name}", $request->user());

        return $this->successResponse($role->load('permissions'), 'Role created successfully', 201);
    }

    /**
     * Update custom role and permissions matrix
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        // Super Admin role protection
        if ($role->is_system) {
            return $this->errorResponse('System roles (Super Admin) cannot be modified or reconfigured.', 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', "unique:roles,name,{$id}"],
            'description' => ['nullable', 'string', 'max:255'],
            'permission_ids' => ['required', 'array'],
            'permission_ids.*' => ['exists:permissions,id'],
        ]);

        $role->update([
            'name' => strip_tags($validated['name']),
            'slug' => Str::slug($validated['name']),
            'description' => isset($validated['description']) ? strip_tags($validated['description']) : null,
        ]);

        $role->permissions()->sync($validated['permission_ids']);

        ActivityLog::log('ROLE_UPDATED', "Role updated: {$role->name}", $request->user());

        return $this->successResponse($role->fresh('permissions'), 'Role updated successfully');
    }

    /**
     * Delete custom role
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $role = Role::findOrFail($id);

        if ($role->is_system) {
            return $this->errorResponse('System roles cannot be deleted.', 403);
        }

        if ($role->users()->count() > 0) {
            return $this->errorResponse('Cannot delete a role that is currently assigned to staff members.', 400);
        }

        $name = $role->name;
        $role->permissions()->detach();
        $role->delete();

        ActivityLog::log('ROLE_DELETED', "Role deleted: {$name}", $request->user());

        return $this->successResponse(null, 'Role deleted successfully');
    }
}

