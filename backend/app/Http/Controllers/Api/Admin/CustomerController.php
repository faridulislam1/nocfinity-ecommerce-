<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    use ApiResponseTrait;

    /**
     * List all registered customers with aggregate order stats
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::whereDoesntHave('roles')
            ->withCount('orders')
            ->withSum(['orders' => function ($q) {
                $q->where('payment_status', 'paid');
            }], 'total_amount');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest('id')->paginate(15);

        return $this->paginatedResponse($customers, 'Customers retrieved');
    }

    /**
     * Single customer detail with order history
     */
    public function show(int $id): JsonResponse
    {
        $customer = User::whereDoesntHave('roles')
            ->with(['orders' => function ($q) {
                $q->latest('created_at')->with('items');
            }])
            ->findOrFail($id);

        return $this->successResponse($customer, 'Customer profile and orders retrieved');
    }
}

