import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F0F0F0] text-black pt-24 sm:pt-28 pb-12 relative mt-20 w-full overflow-hidden">
      {/* ================= FIGMA FLOATING NEWSLETTER BANNER ================= */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute -top-20 left-0 right-0">
        <div className="bg-black text-white rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-xs font-bold">
                𝕏
              </span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-xs font-bold">
                ig
              </span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors cursor-pointer shadow-xs text-xs font-bold">
                git
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
