'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Smartphone,
  KeyRound,
  Lock,
  Loader2,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

function MockBkashContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentID = searchParams.get('paymentID') || `BKASH-MOCK-${Date.now()}`;
  const amount = searchParams.get('amount') || '349';
  const invoice = searchParams.get('invoice') || `INV-${Date.now()}`;
  const payerQuery = searchParams.get('payer') || '';
  const appointmentId = searchParams.get('appointmentId') || '';
  const callbackURL = searchParams.get('callbackURL') || '';

  // Step 1: Account Number, Step 2: OTP, Step 3: PIN
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Inputs
  const [accountNumber, setAccountNumber] = useState(payerQuery || '01712345678');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [otp, setOtp] = useState('123456');
  const [pin, setPin] = useState('');

  // States
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resendTimer, setResendTimer] = useState(120);

  // OTP Countdown timer
  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [step, resendTimer]);

  const handleClose = () => {
    const targetUrl = callbackURL
      ? `${decodeURIComponent(callbackURL)}?paymentID=${paymentID}&status=cancel&appointmentId=${appointmentId}`
      : `/payment/callback?paymentID=${paymentID}&status=cancel&appointmentId=${appointmentId}`;
    router.push(targetUrl);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accountNumber || accountNumber.replace(/\D/g, '').length < 11) {
      setError('Please enter a valid 11-digit bKash Account Number.');
      return;
    }
    if (!agreedTerms) {
      setError('Please accept terms & conditions to proceed.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      setResendTimer(120);
    }, 600);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 600);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!pin || pin.trim().length < 4) {
      setError('Please enter your 5-digit bKash PIN.');
      return;
    }

    setIsProcessing(true);

    // Simulate realistic bank authorization delay (1.5 seconds)
    setTimeout(() => {
      const targetUrl = callbackURL
        ? `${decodeURIComponent(callbackURL)}?paymentID=${paymentID}&status=success&appointmentId=${appointmentId}`
        : `/payment/callback?paymentID=${paymentID}&status=success&appointmentId=${appointmentId}`;
      window.location.href = targetUrl;
    }, 1500);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#c82363]/10 flex flex-col items-center justify-center p-3 sm:p-4 font-sans select-none">
      {/* Simulation Banner Notice */}
      <div className="mb-3 px-3.5 py-1.5 rounded-full bg-[#e2136e]/10 border border-[#e2136e]/30 text-[#e2136e] text-xs font-bold flex items-center gap-1.5 shadow-sm">
        <span className="w-2 h-2 rounded-full bg-[#e2136e] animate-ping" />
        <span>bKash Payment Gateway Sandbox Simulator (Test Mode)</span>
      </div>

      {/* Main bKash Payment Window Card */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header - Authentic bKash Magenta */}
        <div className="bg-[#e2136e] p-5 text-white relative">
          {/* Logo row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                {/* Authentic bKash stylized bird / icon placeholder */}
                <span className="text-[#e2136e] font-black text-2xl leading-none">b</span>
              </div>
              <span className="font-black text-2xl tracking-tight text-white">bKash</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-pink-200 block">
                Merchant
              </span>
              <span className="font-extrabold text-xs text-white">CityDoctor Ltd</span>
            </div>
          </div>

          {/* Amount and Invoice Card */}
          <div className="mt-4 pt-3 border-t border-pink-400/40 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-pink-200 font-medium">Invoice Number</p>
              <p className="font-mono text-xs font-bold text-white truncate max-w-[170px]">
                {invoice}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-pink-200 font-medium">Amount</p>
              <p className="text-xl font-black font-mono text-white">৳ {amount}</p>
            </div>
          </div>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-[#b80e57] px-5 py-2 flex items-center justify-between text-xs text-pink-100 font-semibold border-t border-pink-400/30">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 1 ? 'bg-white text-[#e2136e]' : 'bg-pink-300/40 text-white'
              }`}
            >
              1
            </span>
            <span>Account</span>
          </span>
          <span className="text-pink-300">→</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 2 ? 'bg-white text-[#e2136e]' : 'bg-pink-300/40 text-white'
              }`}
            >
              2
            </span>
            <span>OTP</span>
          </span>
          <span className="text-pink-300">→</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step === 3 ? 'bg-white text-[#e2136e]' : 'bg-pink-300/40 text-white'
              }`}
            >
              3
            </span>
            <span>PIN</span>
          </span>
        </div>

        {/* Form Body Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: ACCOUNT NUMBER INPUT                                              */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-slate-800">
                  Your bKash Account number
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Enter your 11-digit bKash registered mobile number
                </p>
              </div>

              <div className="relative">
                <Smartphone className="w-5 h-5 text-[#e2136e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="e.g. 01XXXXXXXXX"
                  value={accountNumber}
                  onChange={(e) => {
                    setError(null);
                    setAccountNumber(e.target.value.replace(/[^\d]/g, '').slice(0, 11));
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 text-slate-900 font-mono text-base font-bold text-center tracking-wider focus:outline-none focus:border-[#e2136e] focus:ring-2 focus:ring-[#e2136e]/20 transition-all"
                />
              </div>

              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#e2136e] rounded cursor-pointer"
                />
                <span className="text-[11px] leading-tight text-slate-500">
                  By clicking on <strong className="text-slate-700">PROCEED</strong>, you are agreeing to the{' '}
                  <span className="text-[#e2136e] font-semibold underline">terms &amp; conditions</span>.
                </span>
              </label>

              {/* Action Buttons: PROCEED / CLOSE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  CLOSE
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#e2136e] hover:bg-[#c80e5d] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#e2136e]/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>WAIT...</span>
                    </>
                  ) : (
                    <span>PROCEED</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: OTP / VERIFICATION CODE                                           */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-slate-800">
                  bKash Verification Code (OTP)
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Verification code has been sent to{' '}
                  <span className="font-bold text-[#e2136e]">{accountNumber}</span>
                </p>
              </div>

              <div className="relative">
                <KeyRound className="w-5 h-5 text-[#e2136e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    setError(null);
                    setOtp(e.target.value.replace(/[^\d]/g, '').slice(0, 6));
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 text-slate-900 font-mono text-lg font-bold text-center tracking-widest focus:outline-none focus:border-[#e2136e] focus:ring-2 focus:ring-[#e2136e]/20 transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span>Didn't receive code?</span>
                {resendTimer > 0 ? (
                  <span className="font-mono text-slate-600 font-semibold">
                    Resend in {formatTimer(resendTimer)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResendTimer(120)}
                    className="text-[#e2136e] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>

              {/* Action Buttons: CONFIRM / CLOSE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  CLOSE
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#e2136e] hover:bg-[#c80e5d] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#e2136e]/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>WAIT...</span>
                    </>
                  ) : (
                    <span>CONFIRM</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: PIN INPUT & SUBMISSION                                            */}
          {/* ========================================================================= */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-base text-slate-800">
                  Enter bKash Account PIN
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Enter 5-digit PIN of your bKash account
                </p>
              </div>

              <div className="relative">
                <Lock className="w-5 h-5 text-[#e2136e] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={5}
                  required
                  placeholder="•••••"
                  value={pin}
                  onChange={(e) => {
                    setError(null);
                    setPin(e.target.value.replace(/[^\d]/g, '').slice(0, 5));
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-300 text-slate-900 font-mono text-xl font-bold text-center tracking-widest focus:outline-none focus:border-[#e2136e] focus:ring-2 focus:ring-[#e2136e]/20 transition-all"
                />
              </div>

              <p className="text-[10px] text-center text-slate-400">
                (Simulator: any dummy 5-digit PIN like 12345 is accepted)
              </p>

              {/* Action Buttons: CONFIRM / CLOSE */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  CLOSE
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-[#e2136e] hover:bg-[#c80e5d] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#e2136e]/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AUTHORIZING...</span>
                    </>
                  ) : (
                    <span>CONFIRM</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Helpline */}
        <div className="bg-gray-100 p-3.5 border-t border-gray-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <PhoneCall className="w-3.5 h-3.5 text-[#e2136e]" />
            <span>16247</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit SSL Encrypted</span>
          </div>
        </div>
      </div>

      {/* Demo helper info below */}
      <div className="mt-4 text-center text-xs text-slate-500 max-w-sm">
        <p>
          💡 <strong>Demo Instructions:</strong> Click Proceed → Confirm OTP (123456) → Enter any 5-digit PIN (e.g. 12345) → Confirm to complete verified booking.
        </p>
      </div>
    </div>
  );
}

export default function MockBkashPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#c82363]/10 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#e2136e]" />
          <p className="text-sm font-semibold text-slate-600">Loading bKash Portal...</p>
        </div>
      }
    >
      <MockBkashContent />
    </Suspense>
  );
}

