'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { fetchApi } from '@/lib/api';
import { Lock, ShieldCheck, ArrowRight, CreditCard, AlertCircle, RefreshCw } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, couponCode, clearCart } = useCart();
  const { user } = useAuth();

  const [preview, setPreview] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('OR');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');

  // Stripe Test Card Simulation / inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      setIsPreviewLoading(false);
      return;
    }

    async function loadPreview() {
      setIsPreviewLoading(true);
      const itemsPayload = cart?.items.map((it) => ({
        product_id: it.product_id,
        quantity: it.quantity,
      }));

      const res = await fetchApi('/checkout/preview', {
        method: 'POST',
        body: JSON.stringify({
          items: itemsPayload,
          coupon_code: couponCode || null,
        }),
      });

      if (res.success && res.data) {
        setPreview(res.data);
      } else {
        setErrorMessage(res.message || 'Unable to compute checkout summary.');
      }
      setIsPreviewLoading(false);
    }

    loadPreview();
  }, [cart, couponCode]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const itemsPayload = cart.items.map((it) => ({
      product_id: it.product_id,
      quantity: it.quantity,
    }));

    // Step 1: Initialize Payment Intent on backend
    const piRes = await fetchApi('/checkout/payment-intent', {
      method: 'POST',
      body: JSON.stringify({
        items: itemsPayload,
        coupon_code: couponCode || null,
        email: email,
      }),
    });

    if (!piRes.success || !piRes.data) {
      setIsSubmitting(false);
      setErrorMessage(piRes.message || 'Failed to initialize Stripe Payment.');
      return;
    }

    const paymentIntentId = piRes.data.payment_intent_id;

    // Step 2: Confirm Order with Backend (Pessimistic Row Locks + Inventory Check + Stock Decrement)
    const confirmRes = await fetchApi('/checkout/confirm', {
      method: 'POST',
      body: JSON.stringify({
        items: itemsPayload,
        coupon_code: couponCode || null,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_address: address,
        shipping_city: city,
        shipping_state: state,
        shipping_postal_code: postalCode,
        shipping_country: country,
        payment_intent_id: paymentIntentId,
        payment_method: 'stripe',
      }),
    });

    setIsSubmitting(false);

    if (confirmRes.success && confirmRes.data?.order) {
      await clearCart();
      const orderNumber = confirmRes.data.order.order_number;
      router.push(`/orders/${orderNumber}?success=true&email=${encodeURIComponent(email)}`);
    } else {
      setErrorMessage(confirmRes.message || 'Checkout failed. Please check stock and details.');
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="max-w-md mx-auto my-20 p-8 bg-white border border-black/10 rounded-2xl text-center space-y-4">
          <h2 className="text-xl font-bold text-black">Your Cart is Empty</h2>
          <p className="text-xs text-black/60">Please add items to your cart before proceeding to checkout.</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-black text-white rounded-full text-xs font-semibold"
          >
            Go to Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-xs text-black/60 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>&gt;</span>
            <Link href="/cart" className="hover:text-black">Cart</Link>
            <span>&gt;</span>
            <span className="text-black font-semibold">Checkout</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase mb-8">
            CHECKOUT
          </h1>

          {errorMessage && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Delivery & Payment Details (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Address */}
              <div className="p-6 rounded-2xl border border-black/10 space-y-5 bg-white">
                <h2 className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">1</span>
                  Delivery Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-bold text-black/70 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black/70 block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black/70 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-black/70 block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      placeholder="Street name and number"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-black/70 block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-black/70 block mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-black/70 block mb-1">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#F0F0F0] rounded-xl text-black focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="p-6 rounded-2xl border border-black/10 space-y-5 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-black uppercase tracking-wider flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold">2</span>
                    Payment Details
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Stripe Test Mode
                  </span>
                </div>

                <div className="p-4 bg-[#F0F0F0] rounded-xl space-y-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-black">
                    <CreditCard className="w-4 h-4" /> Credit Card (Stripe SDK)
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-black/60 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white rounded-lg font-mono text-black text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-black/60 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white rounded-lg font-mono text-black text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-black/60 block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white rounded-lg font-mono text-black text-xs"
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-black/50">
                    💡 Test card: <strong>4242 4242 4242 4242</strong> with any future date.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-black/10 p-6 space-y-5 bg-white">
              <h2 className="text-xl font-bold text-black">Order Summary</h2>

              {/* Items List */}
              <div className="max-h-52 overflow-y-auto space-y-3 divide-y divide-black/5 pr-1">
                {cart.items.map((it) => (
                  <div key={it.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-black line-clamp-1">{it.name}</p>
                      <p className="text-black/50">Qty: {it.quantity} &times; ${it.effective_price.toFixed(2)}</p>
                    </div>
                    <span className="font-bold text-black">${it.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Backend Computed Breakdown */}
              {isPreviewLoading ? (
                <div className="py-4 text-center text-xs text-black/40 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calculating order total...
                </div>
              ) : preview ? (
                <div className="space-y-2.5 text-xs text-black/60 pt-3 border-t border-black/10">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-black">${Number(preview.subtotal).toFixed(2)}</span>
                  </div>

                  {Number(preview.discount_amount) > 0 && (
                    <div className="flex justify-between text-[#FF3333]">
                      <span>Discount ({preview.coupon_applied})</span>
                      <span className="font-bold">-${Number(preview.discount_amount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-black">
                      {Number(preview.shipping_cost) === 0 ? <strong className="text-emerald-600">Free</strong> : `$${Number(preview.shipping_cost).toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-bold text-black">${Number(preview.tax_amount).toFixed(2)}</span>
                  </div>

                  <div className="border-t border-black/10 pt-3 flex justify-between text-lg sm:text-xl font-black text-black">
                    <span>Grand Total</span>
                    <span>${Number(preview.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              ) : null}

              {/* Black Pill Confirm Button */}
              <button
                type="submit"
                disabled={isSubmitting || isPreviewLoading}
                className="w-full py-4 bg-black hover:bg-black/85 text-white text-sm font-medium rounded-full flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Locking Stock &amp; Charging...
                  </>
                ) : (
                  <>
                    Complete Order
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-black/40">
                Pessimistic row locking active to guarantee zero overselling.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
