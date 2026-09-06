'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowLeft, Loader2, ShieldCheck, User } from 'lucide-react';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

export default function PatientSettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setProfile(data?.patient || null))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-xs font-semibold">Loading your settings...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-900">Sign in required</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please log in to your patient account before updating your password.
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 select-none">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-md shadow-blue-700/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base tracking-tight text-blue-800 hidden sm:inline">
                CityDoctor
              </span>
            </Link>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold">
              <User className="w-3 h-3" /> My Settings
            </span>
          </div>
          <Link
            href="/patient/appointments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-slate-600 border border-slate-300 text-xs font-bold shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> My Appointments
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white font-black text-lg flex items-center justify-center shrink-0">
            {(profile.name || 'P').trim().charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile.name} • {profile.phone}
            </p>
          </div>
        </div>

        <ChangePasswordForm role="PATIENT" theme="light" />
      </main>
    </div>
  );
}
