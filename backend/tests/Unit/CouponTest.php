<?php

namespace Tests\Unit;

use App\Models\Coupon;
use Carbon\Carbon;
use Tests\TestCase;

class CouponTest extends TestCase
{
    public function test_percentage_discount_calculation(): void
    {
        $coupon = new Coupon([
            'code' => 'TEST10',
            'type' => 'percentage',
            'value' => 10.00,
        ]);

        $this->assertEquals(10.00, $coupon->calculateDiscount(100.00));
        $this->assertEquals(25.00, $coupon->calculateDiscount(250.00));
    }

    public function test_fixed_discount_calculation(): void
    {
        $coupon = new Coupon([
            'code' => 'TEST20',
            'type' => 'fixed',
            'value' => 20.00,
        ]);

        $this->assertEquals(20.00, $coupon->calculateDiscount(100.00));
    }

    public function test_fixed_discount_does_not_exceed_subtotal(): void
    {
        $coupon = new Coupon([
            'code' => 'BIGDISCOUNT',
            'type' => 'fixed',
            'value' => 150.00,
        ]);

        // When subtotal is $80, a $150 discount should be capped at $80
        $this->assertEquals(80.00, $coupon->calculateDiscount(80.00));
    }

    public function test_coupon_validation_fails_when_inactive(): void
    {
        $coupon = new Coupon([
            'code' => 'INACTIVE',
            'is_active' => false,
            'min_order_amount' => 0,
        ]);

        $error = null;
        $this->assertFalse($coupon->isValidFor(100.00, $error));
        $this->assertEquals('This coupon is not active.', $error);
    }

    public function test_coupon_validation_fails_when_below_min_order_amount(): void
    {
        $coupon = new Coupon([
            'code' => 'MIN50',
            'is_active' => true,
            'min_order_amount' => 50.00,
        ]);

        $error = null;
        $this->assertFalse($coupon->isValidFor(35.00, $error));
        $this->assertStringContainsString('Minimum order amount of $50', $error);
    }

    public function test_coupon_validation_fails_when_expired(): void
    {
        $coupon = new Coupon([
            'code' => 'EXPIRED',
            'is_active' => true,
            'min_order_amount' => 0,
            'expires_at' => Carbon::yesterday(),
        ]);

        $error = null;
        $this->assertFalse($coupon->isValidFor(100.00, $error));
        $this->assertEquals('This coupon has expired.', $error);
    }

    public function test_coupon_validation_fails_when_usage_limit_reached(): void
    {
        $coupon = new Coupon([
            'code' => 'LIMITED',
            'is_active' => true,
            'min_order_amount' => 0,
            'usage_limit' => 5,
            'used_count' => 5,
        ]);

        $error = null;
        $this->assertFalse($coupon->isValidFor(100.00, $error));
        $this->assertEquals('This coupon usage limit has been reached.', $error);
    }

    public function test_coupon_validation_succeeds_when_all_conditions_met(): void
    {
        $coupon = new Coupon([
            'code' => 'VALID20',
            'is_active' => true,
            'min_order_amount' => 50.00,
            'usage_limit' => 100,
            'used_count' => 10,
            'expires_at' => Carbon::now()->addDays(7),
        ]);

        $error = null;
        $this->assertTrue($coupon->isValidFor(75.00, $error));
        $this->assertNull($error);
    }
}
