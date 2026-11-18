'use client';

import React, { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { User, Order } from '@/lib/types';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Users, Search, RefreshCw, Eye, X, ShoppingBag, Clock } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected customer history modal
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isCustomerLoading, setIsCustomerLoading] = useState(false);

  const loadCustomers = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const res = await fetchApi<any[]>(`/admin/customers?${params.toString()}`, { authType: 'admin' });
    if (res.success && res.data) {
      setCustomers(res.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const viewCustomer = async (id: number) => {
    setIsCustomerLoading(true);
    const res = await fetchApi<any>(`/admin/customers/${id}`, { authType: 'admin' });
    if (res.success && res.data) {
      setSelectedCustomer(res.data);
    }
    setIsCustomerLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Customer Directory</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registered customer accounts, aggregate spending, and past purchase history
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by customer name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            Loading customer accounts...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No registered customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4">Total Orders</th>
                  <th className="py-3.5 px-4">Total Settled Spend</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                          <span className="text-[11px] text-slate-400">{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{c.phone || 'N/A'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {c.orders_count || 0} order(s)
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white">
                      ${Number(c.orders_sum_total_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => viewCustomer(c.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg font-bold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Order History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= CUSTOMER ORDER HISTORY MODAL ================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedCustomer.name}</h2>
                  <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Customer Orders History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order History Timeline</h4>
              {selectedCustomer.orders?.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl">
                  No orders placed by this customer yet.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {selectedCustomer.orders?.map((ord: Order) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">#{ord.order_number}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(ord.created_at).toLocaleDateString()} • {ord.items?.length || 0} items
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-slate-900 dark:text-white block">
                          ${Number(ord.total_amount).toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                          {ord.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

