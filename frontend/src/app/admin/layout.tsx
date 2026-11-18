'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Users,
  Shield,
  UserCheck,
  User,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Moon,
  Sun,
  Lock,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, adminToken, isLoading, logout, hasPermission } = useAdminAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // If on login page, render children directly without admin layout chrome
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoading && !adminUser && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [adminUser, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs font-semibold">
        Verifying administrative authorization...
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  // Role-based Nav Items filtered by effective permissions!
  const allNavItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      permission: 'reports.view',
    },
    {
      label: 'Products',
      href: '/admin/products',
      icon: Package,
      permission: 'products.view',
    },
    {
      label: 'Categories',
      href: '/admin/categories',
      icon: Layers,
      permission: 'categories.view',
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: ShoppingBag,
      permission: 'orders.view',
    },
    {
      label: 'Coupons',
      href: '/admin/coupons',
      icon: Tag,
      permission: 'coupons.view',
    },
    {
      label: 'Customers',
      href: '/admin/customers',
      icon: Users,
      permission: 'customers.view',
    },
    {
      label: 'Roles & Permissions',
      href: '/admin/roles',
      icon: Shield,
      permission: 'roles.view',
    },
    {
      label: 'Staff Directory',
      href: '/admin/staff',
      icon: UserCheck,
      permission: 'roles.manage',
    },
    {
      label: 'My Profile',
      href: '/admin/profile',
      icon: User,
      permission: null, // Always accessible
    },
  ];

  // STRICT RBAC UI HIDING: Only display menus the user has permission to view!
  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100/70 text-slate-900'}`}>
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-base">
                N
              </span>
              <div className="leading-tight">
                <span className="font-bold text-white text-base tracking-tight block">Nocfinity</span>
                <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">Staff Control</span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User badge */}
          <div className="p-4 mx-3 my-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              {adminUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminUser.name}</p>
              <span className="inline-block px-1.5 py-0.5 bg-blue-600/30 text-blue-400 text-[10px] font-semibold rounded-md">
                {adminUser.is_super_admin ? 'Super Admin' : Object.values(adminUser.roles || {})[0] || 'Staff'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Visit Storefront
            </span>
            <span className="text-[10px] text-slate-500">Live</span>
          </Link>

          <button
            onClick={async () => {
              await logout();
              router.push('/admin/login');
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Administration Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle (Bonus) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Quick user pill */}
            <div className="text-right text-xs hidden sm:block">
              <p className="font-bold text-slate-900 dark:text-white leading-tight">{adminUser.name}</p>
              <p className="text-[11px] text-slate-400">{adminUser.email}</p>
            </div>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

