'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Settings,
  LayoutDashboard,
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { DoctorSidebar } from '@/components/doctor/DoctorSidebar';

export default function DoctorSettingsPage() {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctor/me')
      .then((r) => r.json())
      .then((data) => setDoctor(data?.authenticated ? data.doctor : null))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
        <p className="text-xs font-semibold">Loading your settings...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-100">Not Authenticated</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please sign in to access doctor security settings.
          </p>
          <Link
            href="/doctor/login"
            className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-slate-950 font-bold text-xs shadow-md"
          >
            Go to Doctor Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 select-none flex">
      {/* Collapsible left sidebar + main content grid */}
      <DoctorSidebar doctorName={doctor.name} doctorImage={doctor.image} specialty={doctor.specialty} />
      <div className="flex-1 flex flex-col min-w-0">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/70 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/25">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent hidden sm:inline">
                CityDoctor
              </span>
            </Link>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/25 font-bold">
              <Settings className="w-3 h-3" /> Doctor Security Settings
            </span>
          </div>
          <Link
            href="/doctor/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 text-xs font-bold shadow-sm transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center gap-4">
          {doctor.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500/40 shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-100">Security Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {doctor.name} • {doctor.specialty}
            </p>
          </div>
          <ArrowLeft className="hidden" />
        </div>

        <ChangePasswordForm role="DOCTOR" theme="dark" />
      </main>
      </div>
    </div>
  );
}
