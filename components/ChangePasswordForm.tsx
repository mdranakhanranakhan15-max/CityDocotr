'use client';

import React, { useState } from 'react';
import {
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface ChangePasswordFormProps {
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  theme?: 'light' | 'dark';
  adminEmail?: string;
}

/**
 * Shared "Change Password" / Security Settings form for every portal.
 * POSTs to the unified /api/auth/change-password endpoint.
 */
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  role,
  theme = 'light',
  adminEmail = '',
}) => {
  const dark = theme === 'dark';
  const [email, setEmail] = useState(adminEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const inputCls = dark
    ? 'w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/60 placeholder-slate-500'
    : 'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/60 placeholder-slate-400';
  const labelCls = dark ? 'font-semibold text-slate-300' : 'font-semibold text-slate-700';
  const sectionCls = dark
    ? 'bg-slate-900/80 border-slate-800 text-slate-100'
    : 'bg-white border-slate-200 text-slate-900';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (role === 'ADMIN' && !email.trim()) {
      setError('Your admin email is required.');
      return;
    }
    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { currentPassword, newPassword };
      if (role === 'ADMIN') {
        payload.role = 'ADMIN';
        payload.email = email.trim();
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setSuccess(data.message || 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const alertCls = (tone: 'error' | 'ok') =>
    tone === 'error'
      ? dark
        ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
        : 'bg-rose-50 border-rose-200 text-rose-700'
      : dark
        ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
        : 'bg-emerald-50 border-emerald-200 text-emerald-700';

  return (
    <section className={`p-5 sm:p-6 rounded-2xl border shadow-sm space-y-4 ${sectionCls}`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            dark
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}
        >
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`font-extrabold text-sm sm:text-base ${dark ? 'text-slate-100' : 'text-slate-900'}`}>
            Change Password
          </h2>
          <p className={`text-[11px] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
            Security settings — verify your current password to set a new one.
          </p>
        </div>
      </div>

      {error && (
        <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${alertCls('error')}`}>
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold border ${alertCls('ok')}`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {role === 'ADMIN' && (
          <div className="space-y-1.5">
            <label className={labelCls}>Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@doctime.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
            <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
              Used to locate your Admin account.
            </p>
          </div>
        )}
        <div className="space-y-1.5">
          <label className={labelCls}>Current Password</label>
          <div className="relative">
            <Lock
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                dark ? 'text-slate-500' : 'text-slate-400'
              }`}
            />
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              autoComplete="current-password"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 4 characters"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelCls}>Confirm New Password</label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              className={inputCls}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswords((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
            dark ? 'text-slate-400 hover:text-teal-300' : 'text-slate-500 hover:text-blue-700'
          }`}
        >
          {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPasswords ? 'Hide passwords' : 'Show passwords'}
        </button>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={
              dark
                ? 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 active:scale-95 transition-all'
                : 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 active:scale-95 transition-all'
            }
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <KeyRound className="w-4 h-4" />
            Update Password
          </button>
        </div>
      </form>
    </section>
  );
};

