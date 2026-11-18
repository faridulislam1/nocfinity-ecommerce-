'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.primary_image?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discount_price)) / Number(product.price)) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    const res = await addToCart(product.id, 1);
    setIsAdding(false);

    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="group relative flex flex-col">
      {/* Figma Image Container with #F0EEED bg & rounded-2xl */}
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-[#F0EEED] rounded-2xl overflow-hidden"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Out of Stock Overlay / Badge */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Out of Stock
          </div>
        ) : product.stock <= 5 ? (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Low Stock ({product.stock})
          </div>
        ) : null}

        {/* Quick Add To Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`absolute bottom-3 right-3 p-2.5 rounded-full shadow-md transition-all duration-200 ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-0'
              : added
              ? 'bg-emerald-600 text-white opacity-100'
              : 'bg-black text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
          }`}
          title="Add to cart"
        >
          {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
        </button>
      </Link>

      {/* Figma Product Details */}
      <div className="pt-3 flex flex-col space-y-1">
        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-sm sm:text-base text-black line-clamp-1 hover:opacity-75 transition-opacity">
            {product.name}
          </h3>
        </Link>

        {/* Figma Star Rating: 4.5/5 */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center text-[#FFC633]">
            <Star className="w-3.5 h-3.5 fill-[#FFC633]" />
            <Star className="w-3.5 h-3.5 fill-[#FFC633]" />
            <Star className="w-3.5 h-3.5 fill-[#FFC633]" />
            <Star className="w-3.5 h-3.5 fill-[#FFC633]" />
            <Star className="w-3.5 h-3.5 fill-[#FFC633] text-[#FFC633]" />
          </div>
          <span className="font-medium text-black text-xs">
            {Number(product.rating || 4.5).toFixed(1)}/5
          </span>
        </div>

        {/* Figma Price & Discount Badge */}
        <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 pt-0.5">
          <span className="font-black text-sm sm:text-xl text-black">
            ${product.effective_price.toFixed(2)}
          </span>
          {hasDiscount && (
            <>
              <span className="font-bold text-xs sm:text-base text-black/40 line-through">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="bg-[#FF3333]/10 text-[#FF3333] font-medium text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
