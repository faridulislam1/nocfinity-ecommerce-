<?php

namespace Tests\Unit;

use App\Models\Product;
use PHPUnit\Framework\TestCase;

class ProductTest extends TestCase
{
    public function test_effective_price_returns_discount_price_when_valid(): void
    {
        $product = new Product([
            'price' => 120.00,
            'discount_price' => 95.00,
            'stock' => 10,
        ]);

        $this->assertEquals(95.00, $product->effective_price);
    }

    public function test_effective_price_returns_regular_price_when_no_discount(): void
    {
        $product = new Product([
            'price' => 120.00,
            'discount_price' => null,
            'stock' => 10,
        ]);

        $this->assertEquals(120.00, $product->effective_price);
    }

    public function test_effective_price_ignores_discount_if_greater_than_regular_price(): void
    {
        $product = new Product([
            'price' => 100.00,
            'discount_price' => 150.00,
            'stock' => 10,
        ]);

        $this->assertEquals(100.00, $product->effective_price);
    }

    public function test_effective_price_ignores_zero_or_negative_discount(): void
    {
        $product = new Product([
            'price' => 100.00,
            'discount_price' => 0.00,
            'stock' => 10,
        ]);

        $this->assertEquals(100.00, $product->effective_price);
    }

    public function test_in_stock_returns_true_when_stock_greater_than_zero(): void
    {
        $product = new Product([
            'price' => 50.00,
            'stock' => 5,
        ]);

        $this->assertTrue($product->in_stock);
    }

    public function test_in_stock_returns_false_when_stock_is_zero_or_negative(): void
    {
        $product = new Product([
            'price' => 50.00,
            'stock' => 0,
        ]);

        $this->assertFalse($product->in_stock);
    }
}

