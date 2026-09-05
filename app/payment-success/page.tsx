'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  Loader2,
  Calendar,
  User,
  Stethoscope,
  CreditCard,
  Smartphone,
  MapPin,
  Phone,
  Video,
  Clock,
  ArrowRight,
  FileText,
} from 'lucide-react';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
  minutesUntilConsultationOpens,
  formatConsultationTime,
} from '@/lib/timeSlot';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const methodParam = searchParams.get('method') || 'bkash';
  const amountParam = searchParams.get('amount');

  const [appointment, setAppointment] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Live clock so the "Call opens at …" button flips to a joinable link the
  // moment the appointment call window opens (5 min before the booked slot).
  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 15000);
    const onFocus = () => setNowTs(Date.now());
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadAppointment() {
      if (!appointmentId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/appointments/${appointmentId}`);
        const data = await res.json();
        if (isMounted) {
          setAppointment(data.success ? data.appointment : null);
        }
      } catch {
        if (isMounted) setAppointment(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadAppointment();
    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const doctor = appointment?.doctor || null;
  const patient = appointment?.patient || null;
  const amount = Number(amountParam || appointment?.amountPaid || doctor?.consultationFee || doctor?.fee || 0);
  const timeSlot = appointment?.timeSlot || 'Your scheduled slot';
  const methodLabel =
    methodParam === 'card' || appointment?.paymentMethod === 'CARD' ? 'Card' : 'bKash';

  // Appointment call window — patients can enter the video room from 5 minutes
  // before the booked slot until the slot duration has elapsed.
  const win = getConsultationWindow(
    appointment?.scheduledAt,
    appointment?.timeSlot,
    doctor?.slotDuration || appointment?.doctor?.slotDuration || 15
  );
  const winStatus = getConsultationWindowStatus(win, new Date(nowTs));
  const opensInMin = minutesUntilConsultationOpens(win, new Date(nowTs));
  const callOpensLabel =
    (win.scheduledAt && formatConsultationTime(win.scheduledAt)) || timeSlot || 'your scheduled time';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fbff] text-slate-900 font-sans select-none">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-blue-800">
              City<span className="text-blue-600">Doctor</span>
            </span>
          </Link>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            Payment Successful
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">Fetching your booking...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-10 text-center max-w-lg w-full space-y-5">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900">Payment Successful!</h1>
              <p className="text-sm text-gray-500 mt-1">
                Your appointment with{' '}
                <strong className="text-slate-800">{doctor?.name || 'the doctor'}</strong> is now
                confirmed.
              </p>
            </div>

            {/* Appointment summary */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Booking ID</span>
                <span className="font-mono text-xs font-bold text-slate-800">
                  #{appointment?.id?.slice(-8)?.toUpperCase() || 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Doctor</div>
                  <div className="font-bold text-slate-800 text-sm truncate">{doctor?.name}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-gray-400">Patient</div>
                  <div className="font-bold text-slate-800 text-sm truncate">
                    {patient?.name || appointment?.patientName}
                  </div>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2">
                    {appointment?.patientPhone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {appointment.patientPhone}
                      </span>
                    )}
                    {appointment?.patientLocation && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {appointment.patientLocation}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-gray-400">Time Slot</div>
                  <div className="font-bold text-slate-800 text-sm">{timeSlot}</div>
                </div>
              </div>


              <div className="border-t border-dashed border-gray-300 pt-3.5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Amount Paid</span>
                  <span className="font-bold text-slate-900 text-sm">৳{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Payment Method</span>
                  <span className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                    {methodLabel === 'bKash' ? (
                      <Smartphone className="w-3.5 h-3.5 text-[#e2136e]" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    {methodLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className="font-bold text-emerald-600 text-sm">PAID & CONFIRMED</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              {winStatus === 'open' || !appointment ? (
                <Link
                  href={`/consultation/${appointment?.id || doctor?.id || ''}`}
                  className="block w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Video className="w-4 h-4" />
                  Join Video Consultation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : winStatus === 'not_started' ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="block w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    Call opens at {callOpensLabel}
                  </button>
                  {opensInMin > 0 && (
                    <p className="text-xs text-slate-500">
                      Opens in ~{opensInMin} min — you can call from 5 minutes before your booked slot.
                    </p>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  disabled
                  className="block w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Clock className="w-4 h-4" />
                  This consultation slot has ended
                </button>
              )}
              <Link
                href={`/prescription/${appointment?.id || ''}`}
                className="block w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                View / Download Prescription
              </Link>
              <Link
                href="/"
                className="block w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-extrabold">CityDoctor</span>
          </div>
          <p className="text-blue-100 text-center sm:text-left">
            Connecting patients across Bangladesh with BMDC-verified physicians 24/7.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Loading payment confirmation...</p>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

