<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrderStatusUpdated;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Models\Product;
use App\Traits\ApiResponseTrait;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all orders with status filter & search
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with(['items.product.primaryImage']);

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $perPage = (int) $request->query('per_page', 15);
        $orders = $query->latest('id')->paginate($perPage);

        return $this->paginatedResponse($orders, 'Orders retrieved');
    }

    /**
     * Get single order detail with items and payment
     */
    public function show(int $id): JsonResponse
    {
        $order = Order::with(['items.product.primaryImage', 'payments', 'user'])->findOrFail($id);
        return $this->successResponse($order, 'Order details retrieved');
    }

    /**
     * Update order status with stock restoration on cancellation & customer notification email
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:pending,paid,processing,shipped,delivered,cancelled'],
        ]);

        $order = Order::with('items.product')->findOrFail($id);
        $previousStatus = $order->status;
        $newStatus = $validated['status'];

        if ($previousStatus === $newStatus) {
            return $this->successResponse($order, 'Order status remains unchanged.');
        }

        DB::transaction(function () use ($order, $previousStatus, $newStatus, $request) {
            // CRITICAL RULE: Cancelled orders restore stock!
            // If the order was paid/processing/shipped and is now cancelled, restore stock for each product.
            if ($newStatus === 'cancelled' && in_array($previousStatus, ['paid', 'processing', 'shipped'])) {
                foreach ($order->items as $orderItem) {
                    if ($orderItem->product_id) {
                        Product::where('id', $orderItem->product_id)->increment('stock', $orderItem->quantity);
                    }
                }
            }

            // Conversely, if previously cancelled order is set back to paid/processing, decrement stock
            if ($previousStatus === 'cancelled' && in_array($newStatus, ['paid', 'processing', 'shipped'])) {
                foreach ($order->items as $orderItem) {
                    if ($orderItem->product_id) {
                        Product::where('id', $orderItem->product_id)->decrement('stock', $orderItem->quantity);
                    }
                }
            }

            $order->status = $newStatus;
            $order->save();

            ActivityLog::log(
                'ORDER_STATUS_CHANGED',
                "Order #{$order->order_number} status changed from {$previousStatus} to {$newStatus}",
                $request->user()
            );
        });

        // Trigger email notification to customer
        try {
            Mail::to($order->customer_email)->send(new OrderStatusUpdated($order, $previousStatus));
        } catch (Exception $e) {
            Log::warning("Order status email sending failed: " . $e->getMessage());
        }

        return $this->successResponse($order->fresh(['items']), "Order status updated to {$newStatus}");
    }
}

