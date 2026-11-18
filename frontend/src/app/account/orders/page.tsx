'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useAuth } from '@/context/auth-context';
import { fetchApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { Package, Clock, ChevronRight, ShoppingBag } from 'lucide-react';

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchApi<Order[]>('/auth/customer/orders', { authType: 'customer' }).then((res) => {
        if (res.success && res.data) {
          setOrders(res.data);
        }
        setIsLoading(false);
      });
    }
  }, [user, isAuthLoading, router]);

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
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/50 py-10 lg:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pb-6 border-b border-slate-200">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">My Orders</h1>
            <p className="text-xs text-slate-500 mt-1">Track current shipments and view previous purchase receipts</p>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400">
              Loading order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center my-10 border border-slate-200 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Package className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">No orders placed yet</h2>
              <p className="text-xs text-slate-500">
                You haven&apos;t placed any orders with this account yet.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4 pt-6">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Order Reference</span>
                      <strong className="text-base font-extrabold text-slate-900">#{ord.order_number}</strong>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${getStatusBadge(
                          ord.status
                        )}`}
                      >
                        {ord.status}
                      </span>
                      <Link
                        href={`/orders/${ord.order_number}`}
                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Items Summary preview */}
                  <div className="py-4 space-y-2">
                    {ord.items?.map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs text-slate-600">
                        <span>
                          <strong>{it.quantity}×</strong> {it.product_name}
                        </span>
                        <span className="font-semibold text-slate-900">${Number(it.total_price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(ord.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div>
                      Total Paid: <strong className="text-slate-900 text-sm font-black">${Number(ord.total_amount).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

