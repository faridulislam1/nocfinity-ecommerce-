'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import { fetchApi } from '@/lib/api';
import { Product, Category } from '@/lib/types';
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, RefreshCw } from 'lucide-react';

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filters state from query parameters
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentInStock = searchParams.get('in_stock') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  useEffect(() => {
    fetchApi<Category[]>('/categories').then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (currentCategory) params.set('category', currentCategory);
      if (currentSearch) params.set('search', currentSearch);
      if (currentSort) params.set('sort', currentSort);
      if (currentMinPrice) params.set('min_price', currentMinPrice);
      if (currentMaxPrice) params.set('max_price', currentMaxPrice);
      if (currentInStock) params.set('in_stock', 'true');
      params.set('page', currentPage.toString());
      params.set('per_page', '9');

      const res = await fetchApi<Product[]>(`/products?${params.toString()}`);
      if (res.success && res.data) {
        setProducts(res.data);
        setMeta(res.meta);
      }
      setIsLoading(false);
    };

    fetchCatalog();
  }, [currentCategory, currentSearch, currentSort, currentMinPrice, currentMaxPrice, currentInStock, currentPage]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`/products?${params.toString()}`);
  };

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      min_price: minPriceInput || null,
      max_price: maxPriceInput || null,
    });
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-black/60 mb-6 flex items-center gap-2">
        <span onClick={() => router.push('/')} className="hover:text-black cursor-pointer">Home</span>
        <span>&gt;</span>
        <span className="text-black font-semibold">
          {currentCategory ? currentCategory.replace('-', ' ') : 'Shop'}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= FIGMA FILTERS SIDEBAR (3 cols) ================= */}
        <aside className="hidden lg:block lg:col-span-3 rounded-2xl border border-black/10 p-6 space-y-6 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-black/10">
            <h2 className="font-bold text-lg text-black">Filters</h2>
            <SlidersHorizontal className="w-4 h-4 text-black/50" />
          </div>

          {/* Categories List */}
          <div className="space-y-2 pb-5 border-b border-black/10 text-xs">
            <button
              onClick={() => updateFilters({ category: null })}
              className={`w-full text-left py-1.5 flex items-center justify-between transition-colors ${
                !currentCategory ? 'font-bold text-black' : 'text-black/60 hover:text-black'
              }`}
            >
              <span>All Products</span>
              <span>&gt;</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => updateFilters({ category: c.slug })}
                className={`w-full text-left py-1.5 flex items-center justify-between transition-colors ${
                  currentCategory === c.slug ? 'font-bold text-black' : 'text-black/60 hover:text-black'
                }`}
              >
                <span>{c.name}</span>
                <span>&gt;</span>
              </button>
            ))}
          </div>

          {/* Price Range */}
          <div className="space-y-3 pb-5 border-b border-black/10">
            <h3 className="font-bold text-sm text-black">Price ($)</h3>
            <form onSubmit={handleApplyPriceFilter} className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] rounded-xl text-black placeholder:text-black/40 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F0F0F0] rounded-xl text-black placeholder:text-black/40 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-black/85 transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>

          {/* Colors (Figma Hallmark) */}
          <div className="space-y-3 pb-5 border-b border-black/10">
            <h3 className="font-bold text-sm text-black">Colors</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {[
                { name: 'Green', hex: '#00C12B' },
                { name: 'Red', hex: '#F50606' },
                { name: 'Yellow', hex: '#F5DD06' },
                { name: 'Orange', hex: '#F57906' },
                { name: 'Sky Blue', hex: '#06CAF5' },
                { name: 'Blue', hex: '#063AF5' },
                { name: 'Purple', hex: '#7D06F5' },
                { name: 'Pink', hex: '#F506A4' },
                { name: 'White', hex: '#FFFFFF', border: true },
                { name: 'Black', hex: '#000000' },
              ].map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => updateFilters({ search: c.name.toLowerCase() })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                    c.border ? 'border border-black/20' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Size (Figma Hallmark) */}
          <div className="space-y-3 pb-5 border-b border-black/10">
            <h3 className="font-bold text-sm text-black">Size</h3>
            <div className="flex flex-wrap gap-2">
              {[
                'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large'
              ].map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => updateFilters({ search: sz.toLowerCase() })}
                  className="px-3 py-1.5 bg-[#F0F0F0] hover:bg-black hover:text-white text-black/60 rounded-full text-xs font-medium transition-colors"
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Dress Style (Figma Hallmark) */}
          <div className="space-y-2 pb-5 border-b border-black/10 text-xs">
            <h3 className="font-bold text-sm text-black pb-1">Dress Style</h3>
            {['Casual', 'Formal', 'Party', 'Gym'].map((style) => (
              <button
                key={style}
                onClick={() => updateFilters({ search: style.toLowerCase() })}
                className="w-full text-left py-1.5 flex items-center justify-between text-black/60 hover:text-black transition-colors"
              >
                <span>{style}</span>
                <span>&gt;</span>
              </button>
            ))}
          </div>

          {/* Availability */}
          <div className="pb-4 border-b border-black/10">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-black">
              <input
                type="checkbox"
                checked={currentInStock}
                onChange={(e) => updateFilters({ in_stock: e.target.checked ? 'true' : null })}
                className="rounded-sm accent-black"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Clear Filters Pill */}
          <button
            onClick={clearAllFilters}
            className="w-full py-3 bg-[#F0F0F0] hover:bg-black hover:text-white text-black text-xs font-semibold rounded-full transition-colors"
          >
            Clear All Filters
          </button>
        </aside>

        {/* ================= MAIN PRODUCTS LISTING (9 cols) ================= */}
        <section className="lg:col-span-9 space-y-6">
          {/* Top Bar: Title, Count, Sort, Mobile Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight uppercase">
                {currentCategory ? currentCategory.replace('-', ' ') : currentSearch ? `Search: "${currentSearch}"` : 'All Products'}
              </h1>
              {meta && (
                <p className="text-xs text-black/60 mt-0.5">
                  Showing {products.length} of {meta.total} Products
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-2 bg-[#F0F0F0] rounded-full text-black hover:bg-black hover:text-white transition-colors"
                title="Filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Sort by dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-black/60">
                <span>Sort by:</span>
                <select
                  value={currentSort}
                  onChange={(e) => updateFilters({ sort: e.target.value })}
                  className="font-bold text-black bg-transparent border-none focus:outline-hidden cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid of Product Cards */}
          {isLoading ? (
            <div className="h-80 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-black" />
              <p className="text-xs text-black/50">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-xs text-black/60 border border-black/10 rounded-2xl bg-white space-y-3">
              <p className="font-bold text-sm text-black">No products found matching your filter criteria</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2 bg-black text-white rounded-full text-xs font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Figma Pagination Bar */}
              {meta && meta.last_page > 1 && (
                <div className="pt-10 border-t border-black/10 flex items-center justify-between text-xs">
                  <button
                    onClick={() => updateFilters({ page: (currentPage - 1).toString() })}
                    disabled={currentPage <= 1}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-black/10 font-semibold text-black hover:bg-black hover:text-white disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => updateFilters({ page: pg.toString() })}
                        className={`w-8 h-8 rounded-lg font-bold transition-colors ${
                          currentPage === pg ? 'bg-black text-white' : 'text-black/60 hover:bg-black/5'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => updateFilters({ page: (currentPage + 1).toString() })}
                    disabled={currentPage >= meta.last_page}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-black/10 font-semibold text-black hover:bg-black hover:text-white disabled:opacity-30 transition-colors"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer (390px) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white p-6 overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <h3 className="font-bold text-black text-base">Filters</h3>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-bold uppercase tracking-wider block text-black/50">Categories</span>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      updateFilters({ category: c.slug });
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full text-left py-1 text-black/80"
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-black text-white rounded-full text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <Suspense fallback={<div className="p-12 text-center text-xs text-black/40">Loading catalog...</div>}>
          <ProductsCatalogContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
