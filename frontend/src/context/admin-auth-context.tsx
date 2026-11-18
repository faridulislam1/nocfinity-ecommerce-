'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AdminAuthContextType {
  adminUser: User | null;
  adminToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permissionSlug: string) => boolean;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAdmin = async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    const savedToken = localStorage.getItem('admin_token');
    if (!savedToken) {
      setAdminUser(null);
      setAdminToken(null);
      setIsLoading(false);
      return;
    }

    setAdminToken(savedToken);
    try {
      const res = await fetchApi<User>('/admin/auth/me', { authType: 'admin' });
      if (res.success && res.data) {
        setAdminUser(res.data);
      } else {
        localStorage.removeItem('admin_token');
        setAdminUser(null);
        setAdminToken(null);
      }
    } catch {
      localStorage.removeItem('admin_token');
      setAdminUser(null);
      setAdminToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAdmin();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ user: User; token: string }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('admin_token', res.data.token);
      setAdminToken(res.data.token);
      setAdminUser(res.data.user);
      return { success: true };
    }

    return { success: false, message: res.message || 'Authentication failed' };
  };

  const logout = async () => {
    await fetchApi('/admin/auth/logout', {
      method: 'POST',
      authType: 'admin',
    });
    localStorage.removeItem('admin_token');
    setAdminUser(null);
    setAdminToken(null);
  };

  const hasPermission = (permissionSlug: string): boolean => {
    if (!adminUser) return false;
    if (adminUser.is_super_admin) return true;
    if (adminUser.permissions?.includes('*')) return true;
    return !!adminUser.permissions?.includes(permissionSlug);
  };

  return (
    <AdminAuthContext.Provider
      value={{ adminUser, adminToken, isLoading, login, logout, hasPermission, refreshAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

