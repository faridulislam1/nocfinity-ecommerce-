'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '@/context/admin-auth-context';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();

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
      router.push('/admin');
    } else {
      setErrorMessage(res.message || 'Invalid staff credentials or insufficient privileges.');
    }
  };

  const handleQuickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto mb-2">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Staff Administration</h1>
          <p className="text-xs text-slate-400">Restricted zone. Role-based granular permissions enforced.</p>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Staff Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@nocfinity.com"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-blue-500 text-white placeholder-slate-600"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Security Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:outline-hidden focus:border-blue-500 text-white placeholder-slate-600"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Authenticating Guard...
              </>
            ) : (
              <>
                Enter Admin Portal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Staff Logins */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Quick-Fill Staff Roles for Evaluation:
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('superadmin@nocfinity.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left truncate font-semibold"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@nocfinity.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left truncate font-semibold"
            >
              ⚡ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('product@nocfinity.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left truncate font-semibold"
            >
              📦 Product Mgr
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('order@nocfinity.com')}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left truncate font-semibold"
            >
              🚚 Order Mgr
            </button>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

