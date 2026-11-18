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

  // Calculate highest revenue in chart data for bar chart scaling
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100);

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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              30-Day Sales &amp; Revenue Velocity
            </h3>
            <p className="text-xs text-slate-400">Daily revenue breakdown from fulfilled Stripe transactions</p>
          </div>
        </div>

        {/* Bar Chart Representation */}
        <div className="pt-6">
          <div className="h-44 flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-2">
            {chartData.map((bar, idx) => {
              const heightPercent = Math.max(8, Math.round((bar.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 min-w-[14px] flex flex-col items-center group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md z-20 whitespace-nowrap shadow-lg">
                    <span>{bar.date}: <strong>${bar.revenue.toFixed(2)}</strong> ({bar.orders_count} orders)</span>
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-md transition-all ${
                      bar.revenue > 0
                        ? 'bg-blue-600 group-hover:bg-blue-500'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                  {idx % 4 === 0 && (
                    <span className="text-[9px] text-slate-400 mt-2 truncate max-w-[32px]">
                      {bar.label}
                    </span>
                  )}
                </div>
              );
            })}
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

