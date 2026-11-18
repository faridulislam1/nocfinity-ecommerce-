import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import ProductCard from '@/components/storefront/ProductCard';
import { Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Product, Category } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

  try {
    const [featuredRes, categoriesRes, allProductsRes] = await Promise.all([
      fetch(`${API_URL}/products/featured`, { cache: 'no-store' }),
      fetch(`${API_URL}/categories`, { cache: 'no-store' }),
      fetch(`${API_URL}/products?per_page=8`, { cache: 'no-store' }),
    ]);

    const featured = featuredRes.ok ? (await featuredRes.json()).data || [] : [];
    const categories = categoriesRes.ok ? (await categoriesRes.json()).data || [] : [];
    const recentProducts = allProductsRes.ok ? (await allProductsRes.json()).data || [] : [];

    return { featured, categories, recentProducts };
  } catch (err) {
    console.error('Error fetching home data:', err);
    return { featured: [], categories: [], recentProducts: [] };
  }
}

export default async function HomePage() {
  const { featured, categories, recentProducts } = await getHomeData();

  const newArrivals = recentProducts.slice(0, 4);
  const topSelling = (featured.length > 0 ? featured : recentProducts).slice(0, 4);

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-white">
        {/* ================= FIGMA HERO SECTION ================= */}
        <section className="bg-[#F2F0F1] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-20 pb-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Bold Typography & Stats */}
              <div className="lg:col-span-7 space-y-6 pb-10 sm:pb-16 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight uppercase leading-[1.08]">
                  FIND CLOTHES THAT MATCHES YOUR STYLE
                </h1>

                <p className="text-sm sm:text-base text-black/60 max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
                  Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
                </p>

                <div className="pt-2">
                  <Link
                    href="/products"
                    className="inline-block w-full sm:w-auto px-12 py-3.5 bg-black hover:bg-black/85 text-white font-medium rounded-full text-sm transition-all shadow-sm"
                  >
                    Shop Now
                  </Link>
                </div>

                {/* Figma Stats Counter */}
                <div className="pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 divide-x divide-black/10">
                  <div className="text-left pr-4">
                    <span className="block text-2xl sm:text-4xl font-extrabold text-black">200+</span>
                    <span className="text-xs text-black/60">International Brands</span>
                  </div>
                  <div className="text-left pl-6 sm:pl-10 pr-4">
                    <span className="block text-2xl sm:text-4xl font-extrabold text-black">2,000+</span>
                    <span className="text-xs text-black/60">High-Quality Products</span>
                  </div>
                  <div className="text-left pl-6 sm:pl-10">
                    <span className="block text-2xl sm:text-4xl font-extrabold text-black">30,000+</span>
                    <span className="text-xs text-black/60">Happy Customers</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Image with Star Sparkle Vectors */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none">
                  {/* Decorative Stars from Figma */}
                  <div className="absolute top-4 right-2 sm:right-6 text-black text-5xl sm:text-7xl select-none z-10 animate-pulse">
                    ✦
                  </div>
                  <div className="absolute top-1/2 left-0 text-black text-3xl sm:text-4xl select-none z-10">
                    ✦
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80"
                    alt="Fashion Models"
                    className="w-full h-auto object-cover max-h-[520px] rounded-t-3xl relative z-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FIGMA BRAND LOGOS STRIP ================= */}
        <section className="bg-black py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-around gap-8 text-white font-serif tracking-widest text-xl sm:text-2xl uppercase opacity-90 select-none">
            <span className="hover:opacity-100 transition-opacity">VERSACE</span>
            <span className="hover:opacity-100 transition-opacity">ZARA</span>
            <span className="hover:opacity-100 transition-opacity">GUCCI</span>
            <span className="hover:opacity-100 transition-opacity">PRADA</span>
            <span className="hover:opacity-100 transition-opacity">Calvin Klein</span>
          </div>
        </section>

        {/* ================= FIGMA: NEW ARRIVALS ================= */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              NEW ARRIVALS
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href="/products?sort=newest"
              className="inline-block px-14 py-3 rounded-full border border-black/10 text-xs sm:text-sm font-semibold text-black hover:bg-black hover:text-white transition-all shadow-2xs"
            >
              View All
            </Link>
          </div>
        </section>

        {/* Section Divider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <hr className="border-black/10" />
        </div>

        {/* ================= FIGMA: TOP SELLING ================= */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase">
              TOP SELLING
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {topSelling.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href="/products?sort=popular"
              className="inline-block px-14 py-3 rounded-full border border-black/10 text-xs sm:text-sm font-semibold text-black hover:bg-black hover:text-white transition-all shadow-2xs"
            >
              View All
            </Link>
          </div>
        </section>

        {/* ================= FIGMA: BROWSE BY DRESS STYLE (BENTO GRID) ================= */}
        <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F0F0F0] rounded-3xl p-6 sm:p-12 lg:p-16">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight uppercase font-sans">
                BROWSE BY DRESS STYLE
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6">
              {/* Card 1: Casual (4 cols) */}
              <Link
                href="/products?category=casual"
                className="md:col-span-4 relative rounded-2xl overflow-hidden bg-white h-52 sm:h-64 p-6 group hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <h3 className="font-bold text-xl sm:text-2xl text-black z-10">Casual</h3>
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80"
                  alt="Casual style"
                  className="absolute right-0 bottom-0 w-3/5 h-full object-cover rounded-tl-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Card 2: Formal (8 cols) */}
              <Link
                href="/products?category=formal"
                className="md:col-span-8 relative rounded-2xl overflow-hidden bg-white h-52 sm:h-64 p-6 group hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <h3 className="font-bold text-xl sm:text-2xl text-black z-10">Formal</h3>
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80"
                  alt="Formal style"
                  className="absolute right-0 bottom-0 w-3/5 h-full object-cover rounded-tl-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Card 3: Party (8 cols) */}
              <Link
                href="/products?category=party"
                className="md:col-span-8 relative rounded-2xl overflow-hidden bg-white h-52 sm:h-64 p-6 group hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <h3 className="font-bold text-xl sm:text-2xl text-black z-10">Party</h3>
                <img
                  src="https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&auto=format&fit=crop&q=80"
                  alt="Party style"
                  className="absolute right-0 bottom-0 w-3/5 h-full object-cover rounded-tl-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </Link>

              {/* Card 4: Gym (4 cols) */}
              <Link
                href="/products?category=gym"
                className="md:col-span-4 relative rounded-2xl overflow-hidden bg-white h-52 sm:h-64 p-6 group hover:shadow-lg transition-shadow flex flex-col justify-between"
              >
                <h3 className="font-bold text-xl sm:text-2xl text-black z-10">Gym</h3>
                <img
                  src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
                  alt="Gym style"
                  className="absolute right-0 bottom-0 w-3/5 h-full object-cover rounded-tl-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= FIGMA: OUR HAPPY CUSTOMERS ================= */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight uppercase font-sans">
              OUR HAPPY CUSTOMERS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Review 1: Sarah M. */}
            <div className="p-6 sm:p-8 rounded-2xl border border-black/10 space-y-3 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center text-[#FFC633]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFC633]" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-bold text-black text-base">
                <span>Sarah M.</span>
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
              </div>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                &ldquo;I&apos;m blown away by the quality and style of the clothes I received from Shop.co. From casual wear to tie-dye shirts, every piece has exceeded my expectations.&rdquo;
              </p>
            </div>

            {/* Review 2: Alex K. */}
            <div className="p-6 sm:p-8 rounded-2xl border border-black/10 space-y-3 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center text-[#FFC633]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFC633]" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-bold text-black text-base">
                <span>Alex K.</span>
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
              </div>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                &ldquo;Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes.&rdquo;
              </p>
            </div>

            {/* Review 3: James L. */}
            <div className="p-6 sm:p-8 rounded-2xl border border-black/10 space-y-3 bg-white hover:shadow-md transition-shadow">
              <div className="flex items-center text-[#FFC633]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#FFC633]" />
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-bold text-black text-base">
                <span>James L.</span>
                <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
              </div>
              <p className="text-xs sm:text-sm text-black/60 leading-relaxed">
                &ldquo;As someone who&apos;s always on the lookout for unique fashion pieces, I&apos;m thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with trends.&rdquo;
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
