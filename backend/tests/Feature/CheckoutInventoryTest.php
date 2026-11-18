<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutInventoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_checkout_rejects_out_of_stock_product(): void
    {
        $outOfStockProduct = Product::where('stock', 0)->first();

        $response = $this->postJson('/api/v1/checkout/confirm', [
            'items' => [
                ['product_id' => $outOfStockProduct->id, 'quantity' => 1],
            ],
            'customer_name' => 'Tester',
            'customer_email' => 'test@example.com',
            'shipping_address' => '123 Test St',
            'shipping_city' => 'New York',
            'shipping_postal_code' => '10001',
            'payment_intent_id' => 'pi_mock_123',
        ]);

        $response->assertStatus(422);
        $response->assertJsonPath('success', false);
    }

    public function test_stock_decrements_when_order_is_confirmed(): void
    {
        $product = Product::where('stock', '>', 5)->first();
        $initialStock = $product->stock;

        $response = $this->postJson('/api/v1/checkout/confirm', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2],
            ],
            'customer_name' => 'Jane Buyer',
            'customer_email' => 'jane.buyer@example.com',
            'shipping_address' => '456 Main St',
            'shipping_city' => 'Boston',
            'shipping_postal_code' => '02108',
            'payment_intent_id' => 'pi_mock_456',
        ]);

        $response->assertStatus(201);
        $this->assertEquals($initialStock - 2, $product->fresh()->stock);
    }

    public function test_cancelling_order_restores_stock(): void
    {
        $superAdmin = User::where('email', 'superadmin@nocfinity.com')->first();
        $product = Product::where('stock', '>', 5)->first();
        $initialStock = $product->stock;

        // Place order for 3 items
        $this->postJson('/api/v1/checkout/confirm', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
            'customer_name' => 'John Buyer',
            'customer_email' => 'john.buyer@example.com',
            'shipping_address' => '789 Oak St',
            'shipping_city' => 'Chicago',
            'shipping_postal_code' => '60601',
            'payment_intent_id' => 'pi_mock_789',
        ]);

        $this->assertEquals($initialStock - 3, $product->fresh()->stock);
        $order = Order::latest('id')->first();

        // Admin cancels the order
        $response = $this->actingAs($superAdmin)->putJson("/api/v1/admin/orders/{$order->id}/status", [
            'status' => 'cancelled',
        ]);

        $response->assertStatus(200);
        // Stock must be restored to initial
        $this->assertEquals($initialStock, $product->fresh()->stock);
    }
}

