'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/storefront/Navbar';
import Footer from '@/components/storefront/Footer';
import { useAuth } from '@/context/auth-context';
import { Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await login(email, password);
    setIsLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setErrorMessage(res.message || 'Invalid credentials provided.');
    }
  };

  const handleQuickFill = () => {
    setEmail('customer@nocfinity.com');
    setPassword('Password123!');
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 bg-slate-50/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-extrabold text-slate-900">Welcome Back</h1>
            <p className="text-xs text-slate-500">Sign in to your customer account to track orders & manage cart</p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@nocfinity.com"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In to Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo account quick fill pill */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
            >
              ⚡ Quick-Fill Customer Demo Credentials
            </button>
          </div>

          <p className="text-xs text-center text-slate-500">
            Don&apos;t have an account yet?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

