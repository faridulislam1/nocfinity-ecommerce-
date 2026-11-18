'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/cart-context';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';

export default function FullCartPage() {
  const {
    cart,
    subtotal,
    updateQuantity,
    removeFromCart,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;

    setIsApplying(true);
    setCouponError(null);
    setCouponSuccess(null);

    const res = await applyCoupon(inputCoupon.trim());
    setIsApplying(false);

    if (res.success) {
      setCouponSuccess(res.message || 'Coupon applied!');
      setInputCoupon('');
    } else {
      setCouponError(res.message || 'Failed to apply coupon.');
    }
  };

  const deliveryFee = subtotal >= 100 || subtotal === 0 ? 0 : 15;
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);
  const orderTotal = Math.round((discountedSubtotal + deliveryFee) * 100) / 100;

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Figma Breadcrumb */}
          <nav className="text-xs text-black/60 mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>&gt;</span>
            <span className="text-black font-semibold">Cart</span>
          </nav>

          {/* Figma Headline: YOUR CART */}
          <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase mb-8">
            YOUR CART
          </h1>

          {!cart || cart.items.length === 0 ? (
            <div className="rounded-3xl p-12 text-center my-8 border border-black/10 max-w-md mx-auto space-y-4 bg-white">
              <div className="w-16 h-16 rounded-full bg-[#F0F0F0] flex items-center justify-center mx-auto text-black">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-black">Your cart is empty</h2>
              <p className="text-xs text-black/60 max-w-xs mx-auto">
                Explore our catalog and find the products that match your personal style.
              </p>
              <Link
                href="/products"
                className="inline-block px-8 py-3.5 bg-black hover:bg-black/85 text-white font-medium rounded-full text-xs transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              {/* Left Column: Cart Items Container (7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-black/10 p-4 sm:p-6 divide-y divide-black/10 bg-white">
                {cart.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    {/* Item Thumbnail */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F0EEED] overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-black/40">#</div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-bold text-base sm:text-lg text-black hover:opacity-75 transition-opacity line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          {/* Trash button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[#FF3333] hover:opacity-75 p-1 transition-opacity shrink-0"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                        <p className="text-xs text-black/60 mt-0.5">SKU: {item.sku}</p>
                      </div>

                      {/* Bottom row: Price & Quantity Pill */}
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg sm:text-xl font-black text-black">
                          ${item.total_price.toFixed(2)}
                        </span>

                        {/* Figma Quantity Pill */}
                        <div className="flex items-center bg-[#F0F0F0] rounded-full px-3 py-1.5 gap-4">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="text-black hover:opacity-60 transition-opacity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-black min-w-[12px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="text-black hover:opacity-60 disabled:opacity-30 transition-opacity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Summary (5 cols) */}
              <div className="lg:col-span-5 rounded-2xl border border-black/10 p-5 sm:p-6 space-y-5 bg-white">
                <h2 className="text-xl font-bold text-black">Order Summary</h2>

                {/* Subtotals */}
                <div className="space-y-3 text-sm text-black/60 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-black">${subtotal.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-[#FF3333]">
                      <span>Discount ({couponCode})</span>
                      <span className="font-bold">-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-black">
                      {deliveryFee === 0 ? <strong className="text-emerald-600">Free</strong> : `$${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="border-t border-black/10 pt-3 flex justify-between text-lg sm:text-xl font-black text-black">
                    <span>Total</span>
                    <span>${orderTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Figma Promo Code Input with Rounded-full Pill */}
                <div className="space-y-2 pt-2">
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-full text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span>{couponCode} (-${couponDiscount.toFixed(2)})</span>
                      </div>
                      <button onClick={removeCoupon} className="font-bold text-rose-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Add promo code"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F0F0F0] rounded-full text-xs font-normal focus:outline-hidden placeholder:text-black/40 uppercase"
                        />
                        <Tag className="w-4 h-4 text-black/40 absolute left-3.5 top-3" />
                      </div>
                      <button
                        type="submit"
                        disabled={isApplying || !inputCoupon.trim()}
                        className="px-6 py-2.5 bg-black hover:bg-black/85 text-white text-xs font-medium rounded-full transition-colors disabled:opacity-50"
                      >
                        {isApplying ? '...' : 'Apply'}
                      </button>
                    </form>
                  )}

                  {couponError && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {couponError}
                    </p>
                  )}
                  {couponSuccess && (
                    <p className="text-xs text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Figma "Go to Checkout ->" Pill CTA Button */}
                <Link
                  href="/checkout"
                  className="w-full py-4 bg-black hover:bg-black/85 text-white text-sm font-medium rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  Go to Checkout
                  <ArrowRight className="w-4 h-4" />
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
