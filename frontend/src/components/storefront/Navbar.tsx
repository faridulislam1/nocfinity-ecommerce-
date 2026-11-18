'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User as UserIcon, Menu, X, ChevronDown, Shield, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { fetchApi } from '@/lib/api';
import { Category } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const { itemsCount, openCart } = useCart();
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchApi<Category[]>('/categories').then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-black/10 w-full overflow-hidden">
      {/* Figma Top Announcement Bar */}
      <div className="w-full bg-black text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 text-center font-normal tracking-wide relative flex items-center justify-center">
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 text-center">
          <span>Sign up and get 20% off your first order.</span>
          <Link href="/register" className="font-semibold underline hover:text-slate-300">
            Sign Up Now
          </Link>
        </div>
        <button
          onClick={(e) => {
            const bar = (e.currentTarget.parentElement as HTMLElement);
            if (bar) bar.style.display = 'none';
          }}
          className="absolute right-4 text-white/70 hover:text-white hidden sm:block"
          aria-label="Close announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          {/* Mobile hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-black hover:opacity-75 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Figma Logo: SHOP.CO (Exact Figma Brand Hallmark) */}
          <div className="flex items-center gap-2">
            <Link href="/" className="font-black text-2xl sm:text-3xl tracking-tighter text-black uppercase font-sans">
              SHOP.CO
            </Link>
          </div>

          {/* Figma Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-black">
            <Link href="/products" className="hover:text-black/70 flex items-center gap-1 transition-colors">
              Shop <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </Link>
            <Link href="/products?sort=popular" className="hover:text-black/70 transition-colors">
              On Sale
            </Link>
            <Link href="/products?sort=newest" className="hover:text-black/70 transition-colors">
              New Arrivals
            </Link>
            {categories.slice(0, 2).map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="hover:text-black/70 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Figma Search Input with rounded-full & background #F0F0F0 */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative items-center">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#F0F0F0] border-none rounded-full text-xs font-normal focus:outline-hidden focus:ring-1 focus:ring-black text-black placeholder:text-black/40"
            />
            <Search className="w-4 h-4 text-black/40 absolute left-4 pointer-events-none" />
          </form>

          {/* Right Action Icons: Search (mobile), Cart, Profile, Admin */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-black hover:opacity-70"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Trigger with badge */}
            <button
              onClick={openCart}
              className="relative p-1.5 text-black hover:opacity-70 transition-opacity"
              aria-label="Open Cart"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {itemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Account Icon / Dropdown */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-black/5"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-2xl shadow-xl py-2 z-50">
                      <div className="px-4 py-2 border-b border-black/5">
                        <p className="text-[10px] text-black/50 font-medium">Signed in</p>
                        <p className="text-xs font-bold text-black truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-black hover:bg-black/5"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="p-1.5 text-black hover:opacity-70 transition-opacity" title="Sign In">
                  <UserIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </Link>
              )}
            </div>

            {/* Admin shortcut */}
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full border border-black/20 text-[11px] font-bold text-black hover:bg-black hover:text-white transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Staff
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-white px-5 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F0F0F0] rounded-full text-xs font-normal"
            />
            <Search className="w-4 h-4 text-black/40 absolute left-3.5 top-3" />
          </form>

          <div className="flex flex-col space-y-2 pt-1 font-medium text-sm text-black">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-black/5">
              Home
            </Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-black/5">
              Shop All
            </Link>
            <Link href="/products?sort=popular" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-black/5">
              On Sale
            </Link>
            <Link href="/products?sort=newest" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b border-black/5">
              New Arrivals
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 text-xs text-black/70 pl-2"
              >
                • {c.name}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-xs font-bold text-blue-600 pt-3"
            >
              <Shield className="w-4 h-4" /> Staff Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
