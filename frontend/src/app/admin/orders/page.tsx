'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { useAdminAuth } from '@/context/admin-auth-context';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Truck,
  RotateCcw,
} from 'lucide-react';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialViewId = searchParams.get('view');

  const { hasPermission } = useAdminAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', page.toString());
    params.set('per_page', '12');

    const res = await fetchApi<Order[]>(`/admin/orders?${params.toString()}`, { authType: 'admin' });
    if (res.success && res.data) {
      setOrders(res.data);
      setMeta(res.meta);

      if (initialViewId) {
        const found = res.data.find((o) => o.id.toString() === initialViewId);
        if (found) setSelectedOrder(found);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [search, statusFilter, page]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    setStatusMessage(null);

    const res = await fetchApi(`/admin/orders/${selectedOrder.id}/status`, {
      method: 'PUT',
      authType: 'admin',
      body: JSON.stringify({ status: newStatus }),
    });

    setIsUpdatingStatus(false);

    if (res.success && res.data) {
      setSelectedOrder(res.data);
      setStatusMessage(`Order updated to '${newStatus}'. Customer notified via email.`);
      loadOrders();
    } else {
      setStatusMessage(res.message || 'Failed to update order status.');
    }
  };

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Order Fulfillment</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Order lifecycle management (pending &rarr; paid &rarr; processing &rarr; shipped &rarr; delivered / cancelled)
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by order #, customer name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 w-full sm:w-44"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            Loading orders stream...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No customer orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items Count</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Placed On</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      #{ord.order_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold block text-slate-900 dark:text-white">{ord.customer_name}</span>
                      <span className="text-[10px] text-slate-400">{ord.customer_email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">{ord.items?.length || 0} product(s)</td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ${Number(ord.total_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(ord.status)}`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setStatusMessage(null);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= ORDER INSPECT & STATUS MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Order Management</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">#{selectedOrder.order_number}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Lifecycle Status Controller */}
            {hasPermission('orders.update_status') && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Update Order Status</span>
                  <span className="text-[11px] text-slate-400">
                    Cancelling automatically restores inventory stock &amp; notifies customer.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    disabled={isUpdatingStatus}
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-bold px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled (Restore Stock)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Info</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.customer_name}</p>
                <p className="text-slate-500">{selectedOrder.customer_email}</p>
                {selectedOrder.customer_phone && <p className="text-slate-500">{selectedOrder.customer_phone}</p>}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Shipping Destination</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedOrder.shipping_address}</p>
                <p className="text-slate-500">{selectedOrder.shipping_city}, {selectedOrder.shipping_postal_code}</p>
                <p className="text-slate-500">{selectedOrder.shipping_country}</p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Products</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3">
                {selectedOrder.items?.map((it) => (
                  <div key={it.id} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{it.product_name}</p>
                      <p className="text-[11px] text-slate-400">Qty: {it.quantity} × ${Number(it.unit_price).toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ${Number(it.total_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Paid */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600 dark:text-slate-400">Total Settled</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                ${Number(selectedOrder.total_amount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading orders module...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}

