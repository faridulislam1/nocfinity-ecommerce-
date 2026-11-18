<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponseTrait;

    /**
     * Validate Coupon for Checkout
     */
    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'subtotal' => ['required', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($request->code));
        $subtotal = (float) $request->subtotal;

        $coupon = Coupon::where('code', $code)->first();

        if (!$coupon) {
            return $this->errorResponse('Invalid coupon code.', 404);
        }

        $errorMessage = null;
        if (!$coupon->isValidFor($subtotal, $errorMessage)) {
            return $this->errorResponse($errorMessage, 400);
        }

        $discount = $coupon->calculateDiscount($subtotal);

        return $this->successResponse([
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float) $coupon->value,
            'discount_amount' => $discount,
            'new_subtotal' => round($subtotal - $discount, 2),
        ], 'Coupon applied successfully');
    }
}

