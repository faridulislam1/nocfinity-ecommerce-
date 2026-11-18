<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Coupon;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    use ApiResponseTrait;

    /**
     * List coupons
     */
    public function index(Request $request): JsonResponse
    {
        $query = Coupon::query();

        if ($search = $request->query('search')) {
            $query->where('code', 'like', "%{$search}%");
        }

        $coupons = $query->latest('id')->paginate(15);
        return $this->paginatedResponse($coupons, 'Coupons retrieved');
    }

    /**
     * Store coupon
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper(trim($validated['code'])),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLog::log('COUPON_CREATED', "Coupon created: {$coupon->code}", $request->user());

        return $this->successResponse($coupon, 'Coupon created successfully', 201);
    }

    /**
     * Update coupon
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', "unique:coupons,code,{$id}"],
            'type' => ['required', 'in:percentage,fixed'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
        ]);

        $coupon->update([
            'code' => strtoupper(trim($validated['code'])),
            'type' => $validated['type'],
            'value' => $validated['value'],
            'min_order_amount' => $validated['min_order_amount'] ?? 0,
            'usage_limit' => $validated['usage_limit'] ?? null,
            'starts_at' => $validated['starts_at'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => $validated['is_active'] ?? $coupon->is_active,
        ]);

        ActivityLog::log('COUPON_UPDATED', "Coupon updated: {$coupon->code}", $request->user());

        return $this->successResponse($coupon, 'Coupon updated successfully');
    }

    /**
     * Delete coupon
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $coupon = Coupon::findOrFail($id);
        $code = $coupon->code;
        $coupon->delete();

        ActivityLog::log('COUPON_DELETED', "Coupon deleted: {$code}", $request->user());

        return $this->successResponse(null, 'Coupon deleted successfully');
    }
}

