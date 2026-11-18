<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_unauthenticated_request_to_admin_is_unauthorized(): void
    {
        $response = $this->getJson('/api/v1/admin/dashboard');
        $response->assertStatus(401);
    }

    public function test_regular_customer_cannot_access_admin_endpoints(): void
    {
        $customer = User::where('email', 'customer@nocfinity.com')->first();
        $response = $this->actingAs($customer)->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_super_admin_can_access_admin_endpoints(): void
    {
        $superAdmin = User::where('email', 'superadmin@nocfinity.com')->first();
        $response = $this->actingAs($superAdmin)->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    public function test_order_manager_cannot_create_products_without_permission(): void
    {
        $orderManager = User::where('email', 'order@nocfinity.com')->first();
        $response = $this->actingAs($orderManager)->postJson('/api/v1/admin/products', [
            'name' => 'Unauthorized Product',
            'sku' => 'TEST-FAIL-01',
            'category_id' => 1,
            'price' => 50,
            'stock' => 10,
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['success' => false]);
    }
}

