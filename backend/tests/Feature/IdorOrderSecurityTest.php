<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IdorOrderSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_customer_cannot_view_another_customers_order(): void
    {
        $customerA = User::where('email', 'customer@nocfinity.com')->first();
        $customerB = User::factory()->create([
            'email' => 'other.customer@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $orderA = Order::create([
            'order_number' => 'ORD-TEST-000001',
            'user_id' => $customerA->id,
            'customer_name' => $customerA->name,
            'customer_email' => $customerA->email,
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Springfield',
            'shipping_postal_code' => '12345',
            'subtotal' => 100.00,
            'total_amount' => 108.00,
            'status' => 'paid',
            'payment_status' => 'paid',
        ]);

        // Customer B tries to view Customer A's order via customer portal route
        $res1 = $this->actingAs($customerB)->getJson("/api/v1/auth/customer/orders/{$orderA->id}");
        $res1->assertStatus(403);
        $res1->assertJsonFragment(['success' => false]);

        // Customer B tries to view Customer A's order via order_number route
        $res2 = $this->actingAs($customerB)->getJson("/api/v1/orders/{$orderA->order_number}");
        $res2->assertStatus(403);
        $res2->assertJsonFragment(['success' => false]);
    }

    public function test_anonymous_guest_cannot_view_registered_order_without_matching_email(): void
    {
        $customerA = User::where('email', 'customer@nocfinity.com')->first();

        $orderA = Order::create([
            'order_number' => 'ORD-TEST-000002',
            'user_id' => $customerA->id,
            'customer_name' => $customerA->name,
            'customer_email' => $customerA->email,
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Springfield',
            'shipping_postal_code' => '12345',
            'subtotal' => 100.00,
            'total_amount' => 108.00,
            'status' => 'paid',
            'payment_status' => 'paid',
        ]);

        // Anonymous guest attempts to view without email
        $res = $this->getJson("/api/v1/orders/{$orderA->order_number}");
        $res->assertStatus(403);

        // Anonymous guest attempts to view with incorrect email
        $resWrong = $this->getJson("/api/v1/orders/{$orderA->order_number}?email=wrong@email.com");
        $resWrong->assertStatus(403);

        // Anonymous guest views with matching email (e.g. from receipt link)
        $resCorrect = $this->getJson("/api/v1/orders/{$orderA->order_number}?email={$customerA->email}");
        $resCorrect->assertStatus(200);
        $resCorrect->assertJsonPath('success', true);
    }

    public function test_customer_can_view_own_order(): void
    {
        $customerA = User::where('email', 'customer@nocfinity.com')->first();

        $orderA = Order::create([
            'order_number' => 'ORD-TEST-000003',
            'user_id' => $customerA->id,
            'customer_name' => $customerA->name,
            'customer_email' => $customerA->email,
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Springfield',
            'shipping_postal_code' => '12345',
            'subtotal' => 100.00,
            'total_amount' => 108.00,
            'status' => 'paid',
            'payment_status' => 'paid',
        ]);

        $res = $this->actingAs($customerA)->getJson("/api/v1/orders/{$orderA->order_number}");
        $res->assertStatus(200);
        $res->assertJsonPath('success', true);
    }
}
