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
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form & error when modal opens or view switches
  useEffect(() => {
    setError(null);
    setShowPassword(false);
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

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!signupName.trim() || !signupPhone.trim() || !signupPassword.trim()) {
      setError('Please fill in your name, mobile number, and password.');
      return;
    }

    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signup({
        name: signupName.trim(),
        phone: signupPhone.trim(),
        location: signupLocation.trim() || 'Dhaka',
        password: signupPassword,
      });

      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      } else {
        // Clear fields on success
        setSignupName('');
        setSignupPhone('');
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
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-medium text-slate-900 bg-slate-50/50 focus:bg-white"
                  />
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

