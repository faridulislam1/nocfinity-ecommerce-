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

        // Check if query is by order_number or numeric id
        if (is_numeric($id)) {
            $query->where('id', $id);
        } else {
            $query->where('order_number', $id);
        }

        $order = $query->firstOrFail();

        // STRICT IDOR PROTECTION:
        // If authenticated, ensure the order belongs to this customer (or staff user)
        if ($user) {
            if (!$user->isSuperAdmin() && $user->roles()->count() === 0 && $order->user_id !== $user->id) {
                return $this->errorResponse('Access denied. You can only view your own orders.', 403);
            }
        } else {
            // For guest tracking, require customer email verification in query parameter
            $email = $request->query('email');
            if (!$email || strtolower($order->customer_email) !== strtolower($email)) {
                return $this->errorResponse('Unauthorized to view this order details.', 403);
            }
        }

        return $this->successResponse($order, 'Order details retrieved.');
    }
}

