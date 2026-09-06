'use client';

import React from 'react';
import { ShieldCheck, KeyRound, Info } from 'lucide-react';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 w-full select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Admin Security Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Change your Admin Panel password. Enter your admin email and current
            password to set a new one.
          </p>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
        <p>
          The default seeded administrator is{' '}
          <span className="font-mono text-teal-300">admin@doctime.com</span> with password{' '}
          <span className="font-mono text-teal-300">Admin@123</span>. After your first
          change, only the new password will work.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <KeyRound className="w-4 h-4 text-teal-400" />
        Your password is hashed with bcrypt before it is stored.
      </div>

      <ChangePasswordForm role="ADMIN" theme="dark" adminEmail="admin@doctime.com" />
    </div>
  );
}
