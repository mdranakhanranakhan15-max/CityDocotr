'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Lock,
  MapPin,
  Loader2,
  AlertCircle,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Mail,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    isLoginView,
    closeAuthModal,
    setAuthView,
    toggleAuthView,
    login,
    signup,
  } = useAuth();

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form States
  const [signupMethod, setSignupMethod] = useState<'phone' | 'email'>('phone');
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form & error when modal opens or view switches
  useEffect(() => {
    setError(null);
    setShowPassword(false);
    setSignupMethod('phone');
    setSignupEmail('');
  }, [isLoginView, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Please enter both mobile number/email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (!res.success) {
        setError(res.error || 'Invalid credentials. Please try again.');
      } else {
        // Clear fields on success
        setLoginIdentifier('');
        setLoginPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    setError(null);
    setGoogleLoading(true);
    window.setTimeout(() => {
      setGoogleLoading(false);
      setError('Google sign-in is not enabled yet. Please sign up with Phone or Email.');
    }, 600);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const isPhoneSignup = signupMethod === 'phone';

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (isPhoneSignup && !signupPhone.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    if (!isPhoneSignup && !signupEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!signupPassword.trim()) {
      setError('Please create a password.');
      return;
    }
    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: {
        name: string;
        location: string;
        password: string;
        mobileNumber?: string;
        email?: string;
      } = {
        name: signupName.trim(),
        location: signupLocation.trim() || 'Dhaka',
        password: signupPassword,
      };

      if (isPhoneSignup) {
        payload.mobileNumber = signupPhone.trim();
      } else {
        payload.email = signupEmail.trim().toLowerCase();
      }

      const res = await signup(payload);

      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      } else {
        // Clear fields on success
        setSignupName('');
        setSignupPhone('');
        setSignupEmail('');
        setSignupLocation('');
        setSignupPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during signup.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      {/* Backdrop Click Dismiss */}
      <div className="fixed inset-0" onClick={closeAuthModal} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={closeAuthModal}
            aria-label="Close"
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-3 ring-2 ring-white/20 shadow-inner">
            <Activity className="w-7 h-7 text-white" />
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {isLoginView ? 'Welcome Back!' : 'Create Patient Account'}
          </h3>
          <p className="text-xs text-blue-100 mt-1 font-medium">
            {isLoginView
              ? 'Log in to book appointments & manage your consultations'
              : 'Join 100,000+ patients getting 24/7 doctor consultations'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7">
          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {isLoginView ? (
            /* ========================================================================= */
            /* LOGIN FORM                                                                */
            /* ========================================================================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mobile Number or Email
                </label>
                <div className="relative">
                  {loginIdentifier.includes('@') ? (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  <input
                    type="text"
                    required
                    placeholder="01XXXXXXXXX or you@email.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Forgot Password — self-service password reset */}
                <div className="mt-1.5 flex justify-end">
                  <Link
                    href="/forgot-password"
                    onClick={closeAuthModal}
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-700/20 active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthView(false);
                    }}
                    className="text-blue-700 font-bold hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                  >
                    Sign Up
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* ========================================================================= */
            /* SIGNUP FORM                                                               */
            /* ========================================================================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
                    <path
                      fill="#FFC107"
                      d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C40.3 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.9z"
                    />
                  </svg>
                )}
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  or
                </span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Phone | Email tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setSignupMethod('phone')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    signupMethod === 'phone'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" /> Phone
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod('email')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    signupMethod === 'email'
                      ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammad Rahman"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {signupMethod === 'phone' ? 'Mobile Number' : 'Email Address'}
                </label>
                <div className="relative">
                  {signupMethod === 'phone' ? (
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  ) : (
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  )}
                  {signupMethod === 'phone' ? (
                    <input
                      type="tel"
                      required
                      placeholder="01XXXXXXXXX"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                    />
                  ) : (
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={signupLocation}
                    onChange={(e) => setSignupLocation(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a password (min 4 chars)"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-700/20 active:scale-98 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="pt-3 text-center border-t border-slate-100">
                <p className="text-xs text-slate-500 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setAuthView(true);
                    }}
                    className="text-blue-700 font-bold hover:text-blue-800 hover:underline inline-flex items-center gap-0.5"
                  >
                    Login
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
};

