<?php

namespace Tests\Unit;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderNumberGeneratorTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_number_matches_expected_format(): void
    {
        $orderNumber = Order::generateOrderNumber();
        $year = date('Y');

        $this->assertMatchesRegularExpression("/^ORD-{$year}-\d{6}$/", $orderNumber);
    }
}
