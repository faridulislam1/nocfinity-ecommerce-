'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { Cart, CartItem } from '@/lib/types';

interface CartContextType {
  cart: Cart | null;
  itemsCount: number;
  subtotal: number;
  isLoading: boolean;
  isCartOpen: boolean;
  couponCode: string | null;
  couponDiscount: number;
  appliedCouponDetails: any;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: number, quantity: number) => Promise<{ success: boolean; message?: string }>;
  removeFromCart: (itemId: number) => Promise<{ success: boolean; message?: string }>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeCoupon: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [appliedCouponDetails, setAppliedCouponDetails] = useState<any>(null);

  const refreshCart = async () => {
    try {
      const res = await fetchApi<Cart>('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = async (productId: number, quantity: number = 1) => {
    const res = await fetchApi<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });

    if (res.success && res.data) {
      setCart(res.data);
      openCart();
      return { success: true, message: 'Added to cart' };
    }

    return { success: false, message: res.message || 'Failed to add item to cart' };
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    const res = await fetchApi<Cart>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });

    if (res.success && res.data) {
      setCart(res.data);
      return { success: true };
    }

    return { success: false, message: res.message || 'Failed to update quantity' };
  };

  const removeFromCart = async (itemId: number) => {
    const res = await fetchApi<Cart>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });

    if (res.success && res.data) {
      setCart(res.data);
      return { success: true };
    }

    return { success: false, message: res.message || 'Failed to remove item' };
  };

  const clearCart = async () => {
    const res = await fetchApi<Cart>('/cart', {
      method: 'DELETE',
    });
    if (res.success && res.data) {
      setCart(res.data);
    }
    setCouponCode(null);
    setCouponDiscount(0);
    setAppliedCouponDetails(null);
  };

  const applyCoupon = async (code: string) => {
    const subtotal = cart?.subtotal || 0;
    if (subtotal <= 0) {
      return { success: false, message: 'Your cart is empty.' };
    }

    const res = await fetchApi('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });

    if (res.success && res.data) {
      setCouponCode(res.data.code);
      setCouponDiscount(res.data.discount_amount);
      setAppliedCouponDetails(res.data);
      return { success: true, message: `Coupon ${res.data.code} applied successfully!` };
    }

    return { success: false, message: res.message || 'Invalid coupon code.' };
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
    setAppliedCouponDetails(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemsCount: cart?.items_count || 0,
        subtotal: cart?.subtotal || 0,
        isLoading,
        isCartOpen,
        couponCode,
        couponDiscount,
        appliedCouponDetails,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

