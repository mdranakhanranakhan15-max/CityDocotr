'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  User,
  Calendar,
  CreditCard,
  Smartphone,
  Pencil,
  Tag,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { CardGatewayModal } from '@/components/payment/CardGatewayModal';
import { useAuth } from '@/context/AuthContext';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { currentUser, openAuthModal } = useAuth();

  const doctorId = searchParams.get('doctorId');
  const slotTime = searchParams.get('time');
  const slotDate = searchParams.get('date');

  // A checkout opened without a doctor or a chosen slot is invalid — show an
  // error card instead of hanging on the loading screen.
  const hasRequiredParams = Boolean(doctorId && slotTime && slotDate);

  // Dynamic auth state — prefilled from currentUser if available
  const [user, setUser] = useState<any | null>(currentUser);

  // Sync with currentUser whenever it changes
  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.location) setLocation(currentUser.location);
    }
  }, [currentUser]);

  // Registration / Login form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'card'>('bkash');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isProcessingBkash, setIsProcessingBkash] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Doctor state
  const [doctor, setDoctor] = useState<any | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Fetch the selected doctor with a 4 second timeout + abort support, so a
  // stalled or failed request can never leave the user stuck on the
  // "Preparing secure checkout..." spinner.
  useEffect(() => {
    if (!hasRequiredParams) {
      setIsLoadingDoctor(false);
      return;
    }
    let active = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    setIsLoadingDoctor(true);
    setDoctorError(null);

    (async () => {
      try {
        const res = await fetch(`/api/doctors/${doctorId}`, { signal: controller.signal });
        if (!res.ok) {
          throw new Error('Doctor could not be loaded. Please try again.');
        }
        const data = await res.json();
        if (!data.success || !data.doctor) {
          throw new Error(data.error || 'Doctor could not be loaded. Please try again.');
        }
        if (active) setDoctor(data.doctor);
      } catch (err: any) {
        if (!active) return;
        if (err?.name === 'AbortError') {
          setDoctorError(
            'The request timed out. Please check your internet connection and try again.'
          );
        } else {
          setDoctorError(
            err?.message || 'Something went wrong while loading the doctor. Please try again.'
          );
        }
      } finally {
        clearTimeout(timeoutId);
        if (active) setIsLoadingDoctor(false);
      }
    })();

    return () => {
      active = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [doctorId, hasRequiredParams, retryNonce]);

  // Dynamic Admin pricing — derived from the selected doctor's saved config.
  const fee = Number(doctor?.consultationFee || doctor?.fee || 0);
  const vatPct = Number(doctor?.vatPercent) || 5;
  const vat = fee * (vatPct / 100);
  const platform = Number(doctor?.platformFee || 29);
  const total = fee + vat + platform;
  const netAmount = Math.round(total);

  // Human readable time slot shown on the receipt + stored on the appointment
  const timeSlot = slotTime
    ? `${slotDate ? `${slotDate} • ` : ''}${slotTime}`
    : 'Select your preferred time slot';

  // Persist the patient (Registration / Login) then unlock the checkout view
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningUp(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, location }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }
      setUser(data.patient);
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  // Real bKash API / Card Gateway Trigger
  const handlePay = async () => {
    if (!user) return;
    setPaymentError(null);

    if (paymentMethod === 'bkash') {
      setIsProcessingBkash(true);
      try {
        const res = await fetch('/api/bkash/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctorId: doctor?.id || doctorId,
            patientId: user.id,
            patientName: user.name,
            patientPhone: user.phone,
            patientLocation: user.location,
            timeSlot,
            amount: netAmount,
            symptoms: 'Online Video Consultation',
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.bkashURL) {
          throw new Error(data.error || 'bKash gateway initiation failed. Please try again.');
        }

        // Direct redirection to the authentic bKash PGW Portal
        window.location.href = data.bkashURL;
      } catch (err: any) {
        setIsProcessingBkash(false);
        setPaymentError(err.message || 'Failed to initiate bKash payment.');
      }
    } else {
      setIsCardModalOpen(true);
    }
  };

  // Invalid / incomplete checkout link (no doctorId or slot params) → show an
  // error card with a way back instead of hanging on the loader.
  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] px-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-rose-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Checkout Link Incomplete</h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
              The doctor and appointment slot details for this checkout are missing. Please select
              a doctor and a time slot to continue.
            </p>
          </div>
          <Link
            href="/department/all"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </Link>
        </div>
      </div>
    );
  }

  if (isLoadingDoctor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Preparing secure checkout...</p>
      </div>
    );
  }

  // Doctor fetch failed or timed out → inline retry instead of a stuck spinner.
  if (doctorError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] px-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">Couldn&apos;t Load the Doctor</h1>
            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{doctorError}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => setRetryNonce((n) => n + 1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/department/all"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Doctors
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbff] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <span className="font-black text-2xl sm:text-3xl tracking-tight text-blue-800">
              City<span className="text-blue-600">Doctor</span>
            </span>
          </Link>

          <Link
            href="/department/all"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Doctors
          </Link>
        </div>
      </header>

      {/* Page header */}
      <section className="bg-white border-b border-slate-200 py-6 px-6 sm:px-8 lg:px-10">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-2">
            <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/department/all" className="hover:text-blue-700 transition-colors">Doctors</Link>
            <span>/</span>
            <span className="text-blue-700 font-bold">Checkout</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Secure Checkout</h1>
              <p className="text-xs text-slate-500">Complete your consultation booking &amp; payment</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 py-8 select-none">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Patient Info — Auth / Checkout toggle */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900">Patient Info</h2>
              </div>

              {user ? (
                /* CHECKOUT VIEW: real logged-in patient details */
                <div>
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 border border-gray-200">
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-lg shrink-0">
                      {user.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <span className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Verified
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        {user.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {user.phone}
                          </span>
                        )}
                        {user.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {user.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* AUTH VIEW: clean Registration / Login form */
                <form onSubmit={handleSignup} className="space-y-3">
                  {authError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 mt-[1px] shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="01XXXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="City / Area"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningUp}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                  >
                    {isSigningUp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>Continue / Signup</>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => openAuthModal({ isLoginView: true })}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Sign In with Password
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </section>


            {/* Section 2: Consultation Type */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Schedule video consultation</p>
                    <p className="text-xs text-gray-500">
                      {slotTime ? `${slotDate} • ${slotTime}` : 'Pick your preferred time slot'}
                    </p>
                  </div>
                </div>
                <Link
                  href="/department/all"
                  className="text-blue-600 text-xs font-semibold hover:text-blue-700 flex items-center gap-1"
                >
                  Select appointment time &amp; date
                  <Pencil className="w-3 h-3" />
                </Link>
              </div>
            </section>

            {/* Section 3: Payment Details */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900">Payment Details</h2>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Consultation Fee</span>
                  <span className="font-medium text-slate-800">৳{fee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Vat ({vatPct}%)</span>
                  <span className="font-medium text-slate-800">৳{vat.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Platform Fee</span>
                  <span className="font-medium text-slate-800">৳{platform}</span>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="border-t border-dashed border-gray-300 my-4" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">
                  Net Amount &amp; Payable
                </span>
                <span className="font-bold text-slate-900 text-lg">
                  ৳{Math.round(total)}
                </span>
              </div>
            </section>


            {/* Section 4: Payment Methods */}
            <section className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900">Payment Methods</h2>
              </div>

              <div className="space-y-3">
                {/* Option 1: bKash */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'bkash'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="w-4 h-4 accent-[#E2136E]"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">bKash</p>
                    <p className="text-xs text-gray-500">Pay from your bKash account</p>
                  </div>
                  <span className="text-white text-xs font-bold px-2.5 py-1 rounded-md bg-[#E2136E] shrink-0">
                    bKash
                  </span>
                </label>

                {/* Option 2: Card */}
                <label
                  className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="w-4 h-4 accent-blue-600"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">Card</p>
                    <p className="text-xs text-gray-500">Debit / credit card payment</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-extrabold italic text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">
                      VISA
                    </span>
                    <span className="flex items-center">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-500 -mr-1" />
                      <span className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                    </span>
                  </div>
                </label>
              </div>


              {/* Payment card footer */}
              <div className="mt-5 pt-4 border-t border-gray-200">
                {paymentError && (
                  <div className="mb-3.5 flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm mb-3.5">
                  <span className="text-gray-500">Net payable</span>
                  <span className="font-bold text-slate-900">৳{netAmount}</span>
                </div>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={!user || isProcessingBkash}
                  className="w-full py-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!user ? (
                    <>Complete Patient Registration to Pay</>
                  ) : isProcessingBkash ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Redirecting to bKash Gateway...
                    </>
                  ) : paymentMethod === 'bkash' ? (
                    <>
                      <Smartphone className="w-4 h-4" />
                      Pay with bKash
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay with Card
                    </>
                  )}
                </button>
                {!user && (
                  <p className="mt-2 text-center text-[11px] text-gray-400">
                    Enter your details above to continue to the payment gateway.
                  </p>
                )}
              </div>
            </section>


          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-1 space-y-6">
            {/* Doctor Card */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">
                Your Doctor
              </p>
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-blue-100 shrink-0 border border-gray-200 flex items-center justify-center">
                  {doctor?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 leading-snug">
                    {doctor?.name || 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{doctor?.degrees || ''}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {String(doctor?.specialties || doctor?.specialty || 'General Physician')
                      .split(',')
                      .slice(0, 2)
                      .map((s: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded"
                        >
                          {s.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Promo Code Box */}
            <section className="bg-white rounded-xl border-2 border-dashed border-blue-300 p-4">
              <div className="flex items-center gap-2.5">
                <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoApplied(false);
                  }}
                  placeholder="Do you have a promocode?"
                  className="flex-1 min-w-0 text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setPromoApplied(true)}
                  className="text-blue-600 text-sm font-bold hover:text-blue-700 shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoApplied && (
                <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Promo code applied successfully!
                </p>
              )}
            </section>

            {/* Security note */}
            <div className="flex items-center gap-2 text-[11px] text-gray-500 px-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>100% Secure Payment • BMDC Verified Doctors</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-xs select-none mt-auto">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base">CityDoctor</span>
          </div>
          <p className="text-blue-100 text-center sm:text-left">
            Connecting patients across Bangladesh with BMDC-verified physicians 24/7.
          </p>
          <div className="text-blue-100">
            Emergency Helpline: <strong className="text-white">+880 9612-362867</strong>
          </div>
        </div>
        <div className="bg-white text-slate-600 py-3 text-center border-t border-slate-200 text-xs font-semibold">
          Copyright © 2026 CityDoctor. All rights reserved.
        </div>
      </footer>

      {/* Card Gateway Modal */}
      <CardGatewayModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        doctor={doctor}
        patient={user}
        timeSlot={timeSlot}
        amount={netAmount}
      />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Loading checkout...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

