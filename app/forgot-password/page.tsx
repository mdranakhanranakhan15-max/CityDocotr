'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Activity,
  Phone,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

type Step = 'phone' | 'otp' | 'success';

const inputCls =
  'w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white';
const btnPrimary =
  'w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-700/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showError = (msg: string) => {
    setError(msg);
    setInfo(null);
  };
  const showInfo = (msg: string) => {
    setInfo(msg);
    setError(null);
  };

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return value.length > 0 && digits.length >= 10 && !value.includes('@');
  };

  const handleSendOtp = async (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = phone.trim();
    if (!isValidPhone(trimmed)) {
      showError('Please enter your registered mobile number (e.g. 01XXXXXXXXX).');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        showError(data.error || 'Failed to send OTP. Please try again.');
        return;
      }
      showInfo(data.message || 'A 4-digit OTP has been sent to your mobile.');
      setStep('otp');
    } catch {
      showError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedOtp = otp.trim();
    if (!/^\d{4}$/.test(trimmedOtp)) {
      showError('Please enter the 4-digit OTP code from your SMS.');
      return;
    }
    if (password.length < 4) {
      showError('New password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), otp: trimmedOtp, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success !== true) {
        showError(data.error || 'Failed to reset password. Please try again.');
        return;
      }
      setError(null);
      setInfo(null);
      setStep('success');
    } catch {
      showError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtitle =
    step === 'phone'
      ? 'Enter your registered mobile number — we will text you a 4-digit code.'
      : step === 'otp'
        ? 'Enter the code we texted you and choose a new password.'
        : 'You can now sign in with your new password.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md mb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-3 ring-2 ring-white/20">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight">Reset Password</h1>
          <p className="text-xs text-blue-100 mt-1 font-medium">{subtitle}</p>
        </div>

        <div className="p-6 sm:p-7">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <div className="flex-1">{error}</div>
            </div>
          )}
          {info && step !== 'success' && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
              <div className="flex-1">{info}</div>
            </div>
          )}

          {step === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h2 className="text-lg font-black text-slate-900">Password Changed!</h2>
              <p className="text-sm text-slate-500 mt-1.5 mb-6">
                Your password has been updated successfully. Please sign in with your new password.
              </p>
              <Link href="/" className={btnPrimary}>
                Continue to Home
              </Link>
            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 font-medium">
                  The OTP is delivered to the number registered to your CityDoctor account.
                </p>
              </div>

              <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> {phone}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setPassword('');
                    setConfirmPassword('');
                    setError(null);
                    setInfo(null);
                  }}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">OTP Code</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={4}
                    placeholder="0000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className={`${inputCls} tracking-[0.35em]`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 4 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={btnPrimary}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <div className="pt-2 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Did not receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSubmitting}
                    className="text-blue-700 font-bold hover:text-blue-800 hover:underline"
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Security Badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted &amp; HIPAA / BMDC Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

