'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    const savedToken = localStorage.getItem('customer_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    setToken(savedToken);
    try {
      const res = await fetchApi<User>('/auth/me', { authType: 'customer' });
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        localStorage.removeItem('customer_token');
        setUser(null);
        setToken(null);
      }
    } catch {
      localStorage.removeItem('customer_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetchApi<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data) {
      localStorage.setItem('customer_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      // Trigger cart merge on login!
      await fetchApi('/auth/cart/merge', {
        method: 'POST',
        authType: 'customer',
      });

      return { success: true };
    }

    return { success: false, message: res.message || 'Login failed' };
  };

  const register = async (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) => {
    const res = await fetchApi<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.success && res.data) {
      localStorage.setItem('customer_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return { success: true };
    }

    return { success: false, message: res.message || 'Registration failed' };
  };

  const logout = async () => {
    await fetchApi('/auth/logout', {
      method: 'POST',
      authType: 'customer',
    });
    localStorage.removeItem('customer_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

