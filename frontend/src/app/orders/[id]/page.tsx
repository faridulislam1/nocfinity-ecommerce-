'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { fetchApi } from '@/lib/api';
import { Order } from '@/lib/types';
import { CheckCircle2, Clock, Truck, Package, XCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      setIsLoading(true);
      const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const emailParam = queryParams?.get('email');
      const endpoint = emailParam
        ? `/orders/${orderId}?email=${encodeURIComponent(emailParam)}`
        : `/orders/${orderId}`;

      const res = await fetchApi<Order>(endpoint, { authType: 'customer' });
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Order not found.');
      }
      setIsLoading(false);
    }

    loadOrder();
  }, [orderId]);

  const steps = [
    { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Processing in Warehouse', icon: Package },
    { key: 'shipped', label: 'Dispatched & In Transit', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'paid': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return -1;
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/50 py-10 lg:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-20 text-center text-sm font-semibold text-slate-500">
              Retrieving order details...
            </div>
          ) : error || !order ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
              <p className="text-xs text-slate-500">{error || 'Unable to load order details.'}</p>
              <Link href="/products" className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold">
                Return to Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Success Banner */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Thank You for Your Order!
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Order <strong>#{order.order_number}</strong> has been successfully placed. We have sent a confirmation email to <strong>{order.customer_email}</strong>.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full w-fit mx-auto">
                  <ShieldCheck className="w-4 h-4" /> Payment Status: Paid via Stripe Test Mode
                </div>
              </div>

              {/* Status Stepper Tracker */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">
                  Fulfillment Status: <span className="text-blue-600 capitalize">{order.status}</span>
                </h3>

                {order.status === 'cancelled' ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>This order has been cancelled and any reserved inventory has been automatically restored.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {steps.map((st, idx) => {
                      const Icon = st.icon;
                      const active = getStepIndex(order.status) >= idx;
                      return (
                        <div key={st.key} className="flex flex-col items-center text-center space-y-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs font-semibold ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Items & Shipping Address Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Items (7 cols) */}
                <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Ordered Items</h3>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((it) => (
                      <div key={it.id} className="py-3.5 first:pt-0 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{it.product_name}</p>
                          <p className="text-slate-400">SKU: {it.product_sku || 'N/A'}</p>
                          <p className="text-slate-600 mt-0.5">{it.quantity} × ${Number(it.unit_price).toFixed(2)}</p>
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          ${Number(it.total_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t border-slate-200 pt-4 space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">${Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(order.discount_amount) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount ({order.coupon_code})</span>
                        <span>-${Number(order.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span>${Number(order.shipping_cost).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Amount</span>
                      <span>${Number(order.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-black text-slate-900">
                      <span>Total Paid</span>
                      <span>${Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info (5 cols) */}
                <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-slate-900 text-base">Delivery Details</h3>
                  <div className="text-xs space-y-3 text-slate-600">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recipient</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{order.customer_name}</p>
                      <p className="text-slate-500">{order.customer_email}</p>
                      {order.customer_phone && <p className="text-slate-500">{order.customer_phone}</p>}
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shipping Address</span>
                      <p className="font-semibold text-slate-900 mt-0.5">{order.shipping_address}</p>
                      <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
                      <p>{order.shipping_country}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Date</span>
                      <p className="font-medium text-slate-800 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </Link>
                <Link
                  href="/account/orders"
                  className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  View My Order History
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

