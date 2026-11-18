'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';
import { DashboardStats, SalesChartItem, Order } from '@/lib/types';
import {
  ShoppingBag,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<SalesChartItem[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      const res = await fetchApi<{
        stats: DashboardStats;
        sales_chart: SalesChartItem[];
        recent_orders: Order[];
      }>('/admin/dashboard', { authType: 'admin' });

      if (res.success && res.data) {
        setStats(res.data.stats);
        setChartData(res.data.sales_chart);
        setRecentOrders(res.data.recent_orders);
      }
      setIsLoading(false);
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        Loading dashboard metrics...
      </div>
    );
  }

  // Calculate summary metrics for the 30-day velocity chart
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);
  const total30DayRevenue = chartData.reduce((acc, d) => acc + d.revenue, 0);
  const total30DayOrders = chartData.reduce((acc, d) => acc + d.orders_count, 0);
  const avgDailyRevenue = total30DayRevenue / (chartData.length || 30);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'paid':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Business Overview</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Live metrics, daily sales velocity, and fulfillment stream</p>
      </div>

      {/* ================= 4 STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Today's Orders */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today&apos;s Orders</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats?.today_orders || 0}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Total: {stats?.total_orders || 0} all-time</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Today&apos;s Revenue</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              ${Number(stats?.today_revenue || 0).toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Total: ${Number(stats?.total_revenue || 0).toFixed(2)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Registered Customers</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {stats?.total_customers || 0}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Active buyers</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low-Stock Count */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alerts</span>
            <span className={`text-2xl font-black mt-1 block ${
              (stats?.low_stock_count || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'
            }`}>
              {stats?.low_stock_count || 0}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Items &le; 5 units</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ================= 30-DAY SALES CHART ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Header with Title and Summary Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              30-Day Sales &amp; Revenue Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Daily revenue trajectory and volume across fulfilled transactions
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-right">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase block">30D Revenue</span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-300">${total30DayRevenue.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-right">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase block">Peak Day</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-300">${maxRevenue.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-right hidden md:block">
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase block">Daily Avg</span>
              <span className="text-sm font-black text-purple-700 dark:text-purple-300">${avgDailyRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* High-Contrast Interactive Chart Canvas with Y-Axis */}
        <div className="pt-2">
          <div className="relative flex">
            {/* Y-Axis Guide Labels on the Left */}
            <div className="w-16 shrink-0 h-52 flex flex-col justify-between text-[10px] font-mono text-slate-400 select-none pb-7 pr-2 text-right">
              <span>${Math.round(maxRevenue)}</span>
              <span>${Math.round(maxRevenue * 0.66)}</span>
              <span>${Math.round(maxRevenue * 0.33)}</span>
              <span>$0</span>
            </div>

            {/* Chart Area with Horizontal Dotted Grid Lines */}
            <div className="flex-1 relative h-52 flex flex-col justify-between">
              {/* Dotted Grid lines */}
              <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none" />
              <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none" />
              <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-slate-200 dark:border-slate-800 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-7 border-b border-slate-300 dark:border-slate-700 pointer-events-none" />

              {/* Bars Row */}
              <div className="h-44 flex items-end gap-1 sm:gap-2 pb-0 z-10">
                {chartData.map((bar, idx) => {
                  const isHovered = hoveredIdx === idx;
                  const hasRevenue = bar.revenue > 0;
                  // Ensure visible height for active revenue (at least 15% to 100%)
                  const heightPercent = hasRevenue
                    ? Math.max(14, Math.round((bar.revenue / maxRevenue) * 100))
                    : 3;

                  const tooltipPos =
                    idx < 4
                      ? 'left-0'
                      : idx > chartData.length - 5
                      ? 'right-0'
                      : 'left-1/2 -translate-x-1/2';

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    >
                      {/* Floating Tooltip */}
                      {isHovered && (
                        <div className={`absolute -top-14 z-30 flex flex-col items-center bg-slate-900 border border-slate-700 text-white text-[11px] px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl shadow-black/50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 ${tooltipPos}`}>
                          <span className="font-semibold text-cyan-400">{bar.label} ({bar.date})</span>
                          <span className="font-black text-white text-xs">${bar.revenue.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400">{bar.orders_count} completed orders</span>
                        </div>
                      )}

                      {/* Bar Graphic */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-200 ${
                          hasRevenue
                            ? isHovered
                              ? 'bg-gradient-to-t from-blue-500 via-sky-400 to-cyan-300 shadow-md shadow-cyan-400/50 scale-x-110'
                              : 'bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400 shadow-xs shadow-blue-500/30'
                            : 'bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700/80'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-Axis Date Labels Row */}
              <div className="h-7 flex items-center justify-between text-[10px] font-medium text-slate-400 pt-1 select-none">
                {chartData
                  .filter((_, i) => i % 5 === 0 || i === chartData.length - 1)
                  .map((b, i) => (
                    <span key={i} className="truncate">
                      {b.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RECENT ORDERS TABLE ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Recent Customer Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Manage All Orders <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Placed At</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    #{ord.order_number}
                  </td>
                  <td className="py-3">
                    <span className="font-semibold block text-slate-900 dark:text-white">{ord.customer_name}</span>
                    <span className="text-[11px] text-slate-400">{ord.customer_email}</span>
                  </td>
                  <td className="py-3 font-medium">
                    {ord.items?.length || 0} product(s)
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    ${Number(ord.total_amount).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ord.status)}`}>
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(ord.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/admin/orders?view=${ord.id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

