'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Stethoscope,
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export default function DoctorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/doctor/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      router.push('/doctor/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg tracking-tight bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent">
            CityDoctor
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Patient Portal
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Doctor branded header */}
            <div className="p-7 bg-gradient-to-br from-slate-900 to-slate-950 border-b border-slate-800 text-center relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-teal-500/10 blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />

              <div className="relative">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/25 mb-4">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-xl font-extrabold text-slate-100">Doctor Portal Login</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Sign in to manage consultations &amp; write digital prescriptions
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 mt-[1px] shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="doctor@citydoctor.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>


              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-teal-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Demo Doctor Credentials
            </div>
            <p className="text-slate-400">
              Email: <span className="font-mono text-slate-200">doc-sarah-jenkins@citydoctor.com</span>
            </p>
            <p className="text-slate-400">
              Password: <span className="font-mono text-slate-200">password123</span>
            </p>
            <p className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Credentials are created &amp; managed by the Admin in the Doctor Management panel.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 px-6 text-center text-[11px] text-slate-500 border-t border-slate-800">
        © 2026 CityDoctor. Secure Doctor Portal — BMDC Verified Physicians.
      </footer>
    </div>
  );
}

