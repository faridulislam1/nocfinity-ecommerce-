import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-black relative mt-24 sm:mt-32 w-full">
      {/* ================= FIGMA FLOATING NEWSLETTER BANNER ================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -translate-y-1/2 -mb-16 sm:-mb-20 relative z-10">
        <div className="bg-black text-white rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight max-w-md leading-tight text-center lg:text-left">
            STAY UPTO DATE ABOUT OUR LATEST OFFERS
          </h3>

          <div className="w-full max-w-sm space-y-3">
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full pl-11 pr-4 py-3 bg-white text-black text-xs sm:text-sm rounded-full placeholder:text-black/40 focus:outline-hidden"
              />
              <Mail className="w-4 h-4 text-black/40 absolute left-4 top-3.5" />
            </div>
            <button className="w-full py-3 bg-white text-black text-xs sm:text-sm font-semibold rounded-full hover:bg-white/90 transition-colors">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-6 sm:pt-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 pb-12 border-b border-black/10">
          {/* Brand info */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="font-black text-2xl tracking-tighter uppercase text-black font-sans">
              SHOP.CO
            </Link>
            <p className="text-xs sm:text-sm text-black/60 max-w-xs leading-relaxed">
              We have clothes that suits your style and which you&apos;re proud to wear. From women to men.
            </p>
            <div className="flex items-center gap-3 pt-2 text-black/70">
              <span
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-black"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </span>
              <span
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-black"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </span>
              <span
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-black"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
            </div>
          </div>

          {/* COMPANY */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">COMPANY</h4>
            <ul className="space-y-2.5 text-xs text-black/60">
              <li><Link href="/products" className="hover:text-black transition-colors">About</Link></li>
              <li><Link href="/products" className="hover:text-black transition-colors">Features</Link></li>
              <li><Link href="/products" className="hover:text-black transition-colors">Works</Link></li>
              <li><Link href="/products" className="hover:text-black transition-colors">Career</Link></li>
            </ul>
          </div>

          {/* HELP */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">HELP</h4>
            <ul className="space-y-2.5 text-xs text-black/60">
              <li><Link href="/account/orders" className="hover:text-black transition-colors">Customer Support</Link></li>
              <li><Link href="/account/orders" className="hover:text-black transition-colors">Delivery Details</Link></li>
              <li><Link href="/cart" className="hover:text-black transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/cart" className="hover:text-black transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">FAQ</h4>
            <ul className="space-y-2.5 text-xs text-black/60">
              <li><Link href="/login" className="hover:text-black transition-colors">Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-black transition-colors">Manage Deliveries</Link></li>
              <li><Link href="/account/orders" className="hover:text-black transition-colors">Orders</Link></li>
              <li><Link href="/cart" className="hover:text-black transition-colors">Payments</Link></li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div className="space-y-3">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-black">RESOURCES</h4>
            <ul className="space-y-2.5 text-xs text-black/60">
              <li><Link href="/admin" className="hover:text-black transition-colors">Admin Portal</Link></li>
              <li><Link href="/products" className="hover:text-black transition-colors">Development Blog</Link></li>
              <li><Link href="/products" className="hover:text-black transition-colors">Youtube Playlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-black/60">
          <p>Nocfinity Commerce &copy; 2000-2026, All Rights Reserved</p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-white rounded-md font-semibold text-[10px] shadow-2xs">Visa</span>
            <span className="px-2.5 py-1 bg-white rounded-md font-semibold text-[10px] shadow-2xs">Mastercard</span>
            <span className="px-2.5 py-1 bg-white rounded-md font-semibold text-[10px] shadow-2xs">Stripe</span>
            <span className="px-2.5 py-1 bg-white rounded-md font-semibold text-[10px] shadow-2xs">Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
