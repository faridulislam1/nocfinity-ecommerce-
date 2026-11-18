'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { fetchApi } from '@/lib/api';
import { User, Lock, Shield, Check, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminProfilePage() {
  const { adminUser, refreshAdmin } = useAdminAuth();

  const [name, setName] = useState(adminUser?.name || '');
  const [phone, setPhone] = useState(adminUser?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FALoading, setIs2FALoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const payload: any = { name, phone };

    if (newPassword) {
      if (newPassword !== passwordConfirmation) {
        setIsLoading(false);
        setErrorMessage('New passwords do not match.');
        return;
      }
      payload.current_password = currentPassword;
      payload.password = newPassword;
      payload.password_confirmation = passwordConfirmation;
    }

    const res = await fetchApi('/admin/profile', {
      method: 'PUT',
      authType: 'admin',
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (res.success) {
      setStatusMessage('Profile updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
      refreshAdmin();
    } else {
      setErrorMessage(res.message || 'Failed to update profile settings.');
    }
  };

  const handleToggle2FA = async () => {
    setIs2FALoading(true);
    const res = await fetchApi('/admin/profile/toggle-2fa', {
      method: 'POST',
      authType: 'admin',
    });
    setIs2FALoading(false);

    if (res.success && res.data) {
      setTwoFactorEnabled(res.data.two_factor_enabled);
      setStatusMessage(res.message || '2FA settings updated.');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Staff Profile &amp; Security</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal credentials, contact info, and two-factor authentication (2FA)
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-xs">
        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
          <input
            type="email"
            disabled
            value={adminUser?.email || ''}
            className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed font-mono"
          />
          <span className="text-[10px] text-slate-400 mt-1 block">Account email cannot be altered without super admin approval.</span>
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Change Security Password</h3>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Saving Changes...' : 'Update Settings'}
          </button>
        </div>
      </form>

      {/* 2FA Security Box (Bonus Feature) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Two-Factor Authentication (2FA TOTP)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Require a time-based one-time authentication code for high-privilege staff actions
            </p>
          </div>

          <button
            onClick={handleToggle2FA}
            disabled={is2FALoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              twoFactorEnabled
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {is2FALoading ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>
      </div>
    </div>
  );
}

