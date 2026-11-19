<?php

namespace Tests\Unit;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRbacUnitTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_has_permission_returns_true_for_any_slug(): void
    {
        $superAdminRole = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'is_system' => true,
        ]);

        $user = User::factory()->create();
        $user->roles()->attach($superAdminRole->id);

        $this->assertTrue($user->isSuperAdmin());
        $this->assertTrue($user->hasPermission('any.arbitrary.permission'));
        $this->assertTrue($user->hasPermission('products.create'));
    }

    public function test_regular_user_without_roles_has_no_permissions(): void
    {
        $user = User::factory()->create();

        $this->assertFalse($user->isSuperAdmin());
        $this->assertFalse($user->hasPermission('products.create'));
        $this->assertFalse($user->hasPermission('orders.view'));
    }

    public function test_user_with_role_has_only_assigned_permissions(): void
    {
        $role = Role::create([
            'name' => 'Product Editor',
            'slug' => 'product-editor',
        ]);

        $perm1 = Permission::create([
            'name' => 'Create Products',
            'slug' => 'products.create',
            'group' => 'Products',
        ]);

        $perm2 = Permission::create([
            'name' => 'Delete Orders',
            'slug' => 'orders.delete',
            'group' => 'Orders',
        ]);

        $role->permissions()->attach($perm1->id);

        $user = User::factory()->create();
        $user->roles()->attach($role->id);

        $this->assertTrue($user->hasPermission('products.create'));
        $this->assertFalse($user->hasPermission('orders.delete'));
    }
}
