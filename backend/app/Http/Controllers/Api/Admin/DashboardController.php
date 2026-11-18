<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponseTrait;

    /**
     * Admin Dashboard Overview: Stat cards, 30-day chart, recent orders
     */
    public function index(): JsonResponse
    {
        $today = Carbon::today();

        // 1. Stat Cards
        $todayOrdersCount = Order::whereDate('created_at', $today)->count();
        $todayRevenue = (float) Order::whereDate('created_at', $today)
            ->where('payment_status', 'paid')
            ->sum('total_amount');

        $totalCustomers = User::whereDoesntHave('roles')->count();
        $lowStockCount = Product::where('stock', '<=', 5)->count();

        $totalRevenueAllTime = (float) Order::where('payment_status', 'paid')->sum('total_amount');
        $totalOrdersAllTime = Order::count();

        // 2. 30-Day Sales Chart Data
        $startDate = Carbon::today()->subDays(29);
        $dailyOrders = Order::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as orders_count'),
            DB::raw('SUM(CASE WHEN payment_status = "paid" THEN total_amount ELSE 0 END) as revenue')
        )
            ->whereDate('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateStr = Carbon::today()->subDays($i)->format('Y-m-d');
            $record = $dailyOrders->get($dateStr);
            $chartData[] = [
                'date' => $dateStr,
                'label' => Carbon::parse($dateStr)->format('M d'),
                'revenue' => $record ? (float) $record->revenue : 0.0,
                'orders_count' => $record ? (int) $record->orders_count : 0,
            ];
        }

        // 3. Recent Orders
        $recentOrders = Order::with('items')
            ->latest('created_at')
            ->take(8)
            ->get();

        return $this->successResponse([
            'stats' => [
                'today_orders' => $todayOrdersCount,
                'today_revenue' => round($todayRevenue, 2),
                'total_customers' => $totalCustomers,
                'low_stock_count' => $lowStockCount,
                'total_revenue' => round($totalRevenueAllTime, 2),
                'total_orders' => $totalOrdersAllTime,
            ],
            'sales_chart' => $chartData,
            'recent_orders' => $recentOrders,
        ], 'Dashboard metrics retrieved');
    }
}

