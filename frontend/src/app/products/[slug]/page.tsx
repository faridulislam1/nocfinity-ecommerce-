'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import { fetchApi } from '@/lib/api';
import { Product } from '@/lib/types';
import { useCart } from '@/context/cart-context';
import { Star, Plus, Minus, Check, AlertCircle } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>('olive');
  const [selectedSize, setSelectedSize] = useState<string>('Large');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [added, setAdded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faqs'>('details');

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const res = await fetchApi<{ product: Product; related_products: Product[] }>(`/products/${slug}`);
      if (res.success && res.data) {
        setProduct(res.data.product);
        setRelatedProducts(res.data.related_products || []);
        const primary = res.data.product.primary_image?.image_url || res.data.product.images?.[0]?.image_url;
        setSelectedImage(primary || '');
      }
      setIsLoading(false);
    }

    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-xs font-semibold text-black/50">Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return notFound();
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    Number(product.discount_price) > 0 &&
    Number(product.discount_price) < Number(product.price);

  const discountPercent = hasDiscount
    ? Math.round(((Number(product.price) - Number(product.discount_price)) / Number(product.price)) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    const res = await addToCart(product.id, quantity);
    setIsAdding(false);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white py-6 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Figma Breadcrumb */}
          <nav className="text-xs text-black/60 mb-8 flex items-center gap-2">
            <Link href="/" className="hover:text-black">Home</Link>
            <span>&gt;</span>
            <Link href="/products" className="hover:text-black">Shop</Link>
            <span>&gt;</span>
            {product.category && (
              <>
                <Link href={`/products?category=${product.category.slug}`} className="hover:text-black">
                  {product.category.name}
                </Link>
                <span>&gt;</span>
              </>
            )}
            <span className="text-black font-semibold truncate max-w-[200px]">{product.name}</span>
          </nav>

          {/* ================= FIGMA DETAIL GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Gallery (Figma Desktop: vertical thumbs on left / Mobile: thumbs below main) */}
            <div className="lg:col-span-7 flex flex-col sm:flex-row-reverse gap-4">
              {/* Main Image */}
              <div className="flex-1 rounded-2xl bg-[#F0EEED] overflow-hidden relative aspect-square max-h-[500px]">
                <img
                  src={selectedImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover p-2"
                />

                {isOutOfStock && (
                  <div className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    Out of Stock
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex sm:flex-col gap-3 justify-center sm:justify-start overflow-x-auto sm:overflow-visible shrink-0">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(img.image_url)}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-[#F0EEED] border-2 transition-all shrink-0 ${
                        selectedImage === img.image_url ? 'border-black' : 'border-transparent hover:border-black/20'
                      }`}
                    >
                      <img src={img.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info & Buy Controls */}
            <div className="lg:col-span-5 space-y-4">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight uppercase leading-tight">
                {product.name}
              </h1>

              {/* Star Rating: 4.5/5 */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-[#FFC633]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFC633]" />
                  ))}
                </div>
                <span className="font-medium text-black text-xs">
                  {Number(product.rating || 4.5).toFixed(1)}/5
                </span>
                <span className="text-black/40">({product.reviews_count || 0} Reviews)</span>
              </div>

              {/* Price & Discount */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-black">
                  ${product.effective_price.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl sm:text-2xl font-bold text-black/40 line-through">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    <span className="bg-[#FF3333]/10 text-[#FF3333] font-medium text-xs px-2.5 py-0.5 rounded-full">
                      -{discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed pt-1">
                {product.short_description || product.description || 'Crafted with premium materials and engineered for performance.'}
              </p>

              <hr className="border-black/10 pt-1" />

              {/* Select Colors (Figma Hallmark with active checkmark) */}
              <div className="space-y-2">
                <span className="text-xs text-black/60 font-medium block">Select Colors</span>
                <div className="flex items-center gap-3">
                  {[
                    { id: 'olive', hex: '#4F4631' },
                    { id: 'navy', hex: '#31344F' },
                    { id: 'slate', hex: '#314F4A' },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(col.id)}
                      style={{ backgroundColor: col.hex }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
                        selectedColor === col.id ? 'ring-2 ring-offset-2 ring-black' : ''
                      }`}
                    >
                      {selectedColor === col.id && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-black/10" />

              {/* Choose Size (Figma Hallmark with active pill) */}
              <div className="space-y-2">
                <span className="text-xs text-black/60 font-medium block">Choose Size</span>
                <div className="flex flex-wrap gap-2.5">
                  {['Small', 'Medium', 'Large', 'X-Large'].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all ${
                        selectedSize === sz
                          ? 'bg-black text-white shadow-xs'
                          : 'bg-[#F0F0F0] text-black/60 hover:bg-black/10'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <hr className="border-black/10" />

              {/* Bottom Actions: Quantity Pill + Black Pill Button */}
              <div className="pt-2 flex items-center gap-3">
                {/* Quantity Pill */}
                <div className="flex items-center bg-[#F0F0F0] rounded-full px-4 py-3 gap-5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="text-black hover:opacity-60 transition-opacity disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-black min-w-[14px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="text-black hover:opacity-60 transition-opacity disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add To Cart Pill Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className={`flex-1 py-3.5 px-8 rounded-full text-xs sm:text-sm font-medium transition-all shadow-sm ${
                    isOutOfStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black text-white hover:bg-black/85'
                  }`}
                >
                  {added ? 'Added to Cart ✓' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              {/* Stock info */}
              <div className="text-[11px] text-black/50 pt-1">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold">This product is currently out of stock.</span>
                ) : isLowStock ? (
                  <span className="text-amber-600 font-bold">Hurry! Only {product.stock} units remaining in stock.</span>
                ) : (
                  <span>In Stock ({product.stock} units available) • SKU: {product.sku}</span>
                )}
              </div>
            </div>
          </div>

          {/* ================= FIGMA TABS SECTION ================= */}
          <div className="mt-16 sm:mt-20">
            <div className="flex border-b border-black/10 text-center text-sm font-semibold">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 pb-4 transition-colors ${
                  activeTab === 'details' ? 'border-b-2 border-black text-black font-bold' : 'text-black/40'
                }`}
              >
                Product Details
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 pb-4 transition-colors ${
                  activeTab === 'reviews' ? 'border-b-2 border-black text-black font-bold' : 'text-black/40'
                }`}
              >
                Rating &amp; Reviews
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`flex-1 pb-4 transition-colors ${
                  activeTab === 'faqs' ? 'border-b-2 border-black text-black font-bold' : 'text-black/40'
                }`}
              >
                FAQs
              </button>
            </div>

            <div className="py-8 text-xs sm:text-sm text-black/70 leading-relaxed">
              {activeTab === 'details' && (
                <div className="space-y-4 max-w-3xl">
                  <p>{product.description || product.short_description || 'Engineered with precision for everyday utility and premium aesthetic appeal.'}</p>
                  <ul className="list-disc pl-5 space-y-1 text-black/60">
                    <li>Certified Grade-A materials</li>
                    <li>Designed for long lasting comfort and durability</li>
                    <li>Full manufacturer 1-year replacement warranty</li>
                  </ul>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews Header from Figma */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-bold text-black text-lg sm:text-xl">All Reviews</h3>
                      <span className="text-xs text-black/40">({product.reviews_count || 451})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-black/85 transition-colors">
                        Write a Review
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Review Grid (Figma Screen 3 & 4) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: 'Samantha D.',
                        date: 'Posted on August 14, 2023',
                        rating: 5,
                        text: 'I absolutely love this t-shirt! The design is unique and the fabric feels so soft and comfortable. As a fellow designer, I appreciate the attention to detail. You can definitely feel the quality.',
                      },
                      {
                        name: 'Alex M.',
                        date: 'Posted on August 15, 2023',
                        rating: 4,
                        text: 'The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I\'m quite picky about aesthetics, and this t-shirt definitely gets a thumbs up from me.',
                      },
                      {
                        name: 'Ethan R.',
                        date: 'Posted on August 16, 2023',
                        rating: 5,
                        text: 'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect. I can see the designer\'s touch in every aspect.',
                      },
                      {
                        name: 'Olivia P.',
                        date: 'Posted on August 17, 2023',
                        rating: 5,
                        text: 'As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear. It\'s evident that the designer poured their creativity into making this t-shirt stand out.',
                      },
                    ].map((rev) => (
                      <div
                        key={rev.name}
                        className="p-6 rounded-2xl border border-black/10 space-y-3 bg-white"
                      >
                        <div className="flex items-center text-[#FFC633]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#FFC633]" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-black text-base">
                          <span>{rev.name}</span>
                          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        </div>
                        <p className="text-xs text-black/60 leading-relaxed">&ldquo;{rev.text}&rdquo;</p>
                        <span className="text-[11px] text-black/40 font-medium block pt-1">{rev.date}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-4">
                    <button className="px-10 py-3 rounded-full border border-black/10 text-xs font-semibold text-black hover:bg-black hover:text-white transition-all">
                      Load More Reviews
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-3 max-w-xl">
                  <div>
                    <h4 className="font-bold text-black">When will my order ship?</h4>
                    <p className="text-black/60 mt-0.5">Orders placed before 2 PM EST ship the same business day.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-black">What is the return policy?</h4>
                    <p className="text-black/60 mt-0.5">We offer a 30-day money-back guarantee with zero hassle.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= FIGMA: YOU MIGHT ALSO LIKE ================= */}
          {relatedProducts.length > 0 && (
            <div className="mt-14 sm:mt-20 pt-10 border-t border-black/10">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight uppercase">
                  YOU MIGHT ALSO LIKE
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((rel) => (
                  <ProductCard key={rel.id} product={rel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
