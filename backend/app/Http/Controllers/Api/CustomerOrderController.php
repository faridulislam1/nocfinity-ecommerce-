<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    use ApiResponseTrait;

    /**
     * List Authenticated Customer's Orders
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $orders = Order::where('user_id', $user->id)
            ->with(['items.product.primaryImage'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return $this->paginatedResponse($orders, 'Customer orders retrieved.');
    }

    /**
     * View Single Order with IDOR Ownership Enforcement
     */
    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        $query = Order::with(['items.product.primaryImage', 'payments']);

        $isOrderNumber = !is_numeric($id) || str_starts_with((string) $id, 'ORD-');

        // Check if query is by order_number or numeric id
        if ($isOrderNumber) {
            $query->where('order_number', $id);
        } else {
            $query->where('id', $id);
        }

        $order = $query->firstOrFail();

        // 1. Staff and Super Admin can view any order
        if ($user && ($user->isSuperAdmin() || $user->roles()->count() > 0)) {
            return $this->successResponse($order, 'Order details retrieved.');
        }

        // 2. Strict IDOR protection for internal sequential numeric IDs (e.g. /orders/1, /orders/2)
        if (!$isOrderNumber) {
            if (!$user || $order->user_id !== $user->id) {
                $email = $request->query('email');
                if (!$email || strtolower($order->customer_email) !== strtolower($email)) {
                    return $this->errorResponse('Access denied. You can only view your own orders.', 403);
                }
            }
        } else {
            // 3. For public/human-readable order_number (e.g. ORD-2026-000008):
            // If the order belongs to a registered customer and a DIFFERENT logged-in customer attempts access:
            if ($user && $order->user_id && $order->user_id !== $user->id) {
                return $this->errorResponse('Access denied. You can only view your own orders.', 403);
            }

            // If an email query param is supplied, verify it matches
            $email = $request->query('email');
            if ($email && strtolower($order->customer_email) !== strtolower($email)) {
                return $this->errorResponse('Unauthorized to view this order details.', 403);
            }
        }

        return $this->successResponse($order, 'Order details retrieved.');
    }
}

