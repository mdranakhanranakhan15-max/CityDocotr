'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, KeyRound, Info, BarChart3, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';

interface SiteConfig {
  patientsServed: string;
  bmdcDoctors: string;
  satisfactionRate: string;
  onlineDoctors: string;
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SiteConfig>({
    patientsServed: '500K+',
    bmdcDoctors: '2,500+',
    satisfactionRate: '98.4%',
    onlineDoctors: '4+ Doctors Online',
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [statsMessage, setStatsMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Load the current CMS-controlled homepage stats on mount.
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.stats) {
          setConfig({
            patientsServed: data.stats.patientsServed,
            bmdcDoctors: data.stats.bmdcDoctors,
            satisfactionRate: data.stats.satisfactionRate,
            onlineDoctors: data.stats.onlineDoctors,
          });
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadConfig();
  }, []);

  const handleSaveStats = async () => {
    setIsSavingStats(true);
    setStatsMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setStatsMessage({ ok: true, text: 'Homepage stats updated successfully.' });
      } else {
        setStatsMessage({ ok: false, text: data.error || 'Failed to save stats.' });
      }
    } catch (e) {
      setStatsMessage({ ok: false, text: 'Failed to save stats. Please try again.' });
    } finally {
      setIsSavingStats(false);
    }
  };

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
            Change your Admin Panel password and manage the homepage site stats and metrics shown to patients.
          </p>
        </div>
      </div>

      {/* ============ SITE STATS & METRICS CMS ============ */}
      <section className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-base">Site Stats &amp; Metrics</h2>
            <p className="text-[11px] text-slate-500">
              Controls the headline figures on the public homepage hero band. Saved live to the database.
            </p>
          </div>
        </div>

        {statsMessage && (
          <div
            className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] border ${
              statsMessage.ok
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-red-500/10 text-red-300 border-red-500/30'
            }`}
          >
            {statsMessage.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statsMessage.text}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { key: 'patientsServed', label: 'Patients Served', hint: 'e.g. 500K+' },
            { key: 'bmdcDoctors', label: 'BMDC Doctors', hint: 'e.g. 2,500+' },
            { key: 'satisfactionRate', label: 'Satisfaction %', hint: 'e.g. 98.4%' },
            { key: 'onlineDoctors', label: 'Online Doctors Badge', hint: 'e.g. 4+ Doctors Online' },
          ].map((field) => (
            <label key={field.key} className="flex flex-col gap-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{field.label}</span>
              <input
                value={isLoadingStats ? '' : config[field.key as keyof SiteConfig]}
                onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                placeholder={field.hint}
                disabled={isLoadingStats}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 focus:border-teal-500/50 text-slate-200 text-xs font-mono outline-none placeholder:text-slate-600 transition-colors"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={handleSaveStats}
          disabled={isLoadingStats || isSavingStats}
          className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 active:scale-95 transition-all"
        >
          {isSavingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSavingStats ? 'Saving…' : 'Save Site Stats'}</span>
        </button>
      </section>

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
