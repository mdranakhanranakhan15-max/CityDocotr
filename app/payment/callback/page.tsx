'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Stethoscope,
  Smartphone,
  MapPin,
  Phone,
  Video,
  Clock,
  ArrowRight,
  FileText,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
  minutesUntilConsultationOpens,
  formatConsultationTime,
} from '@/lib/timeSlot';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentID = searchParams.get('paymentID');
  const status = searchParams.get('status');
  const appointmentIdParam = searchParams.get('appointmentId');

  const [state, setState] = useState<'verifying' | 'success' | 'failed' | 'cancelled'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [trxID, setTrxID] = useState<string | null>(null);

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

    async function handlePaymentCallback() {
      // If user cancelled in bKash portal
      if (status === 'cancel') {
        if (isMounted) {
          setState('cancelled');
          setErrorMessage('You have cancelled the bKash payment process.');
        }
        return;
      }

      // If bKash portal returned failure
      if (status === 'failure' || status === 'failed') {
        if (isMounted) {
          setState('failed');
          setErrorMessage('bKash payment failed or was declined by provider.');
        }
        return;
      }

      if (!paymentID) {
        if (isMounted) {
          setState('failed');
          setErrorMessage('Missing paymentID in callback parameters.');
        }
        return;
      }

      // Call execute payment API
      try {
        const res = await fetch('/api/bkash/execute-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentID,
            appointmentId: appointmentIdParam,
          }),
        });

        const data = await res.json();

        if (isMounted) {
          if (res.ok && data.success) {
            setState('success');
            setAppointment(data.appointment || null);
            setTrxID(data.trxID || paymentID);
          } else {
            setState('failed');
            setErrorMessage(data.error || 'Payment verification failed with bKash.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setState('failed');
          setErrorMessage(err.message || 'An unexpected error occurred verifying your payment.');
        }
      }
    }

    handlePaymentCallback();

    return () => {
      isMounted = false;
    };
  }, [paymentID, status, appointmentIdParam]);

  // PAYMENT REDIRECT — both successful and cancelled/failed bKash outcomes
  // return the patient to their appointment list (/patient/appointments) where
  // the booking is shown with its PAID / UNPAID payment badge. The status card
  // stays visible for a few seconds, then redirects automatically.
  useEffect(() => {
    if (state !== 'success' && state !== 'cancelled' && state !== 'failed') return;
    const t = setTimeout(() => router.push('/patient/appointments'), 4000);
    return () => clearTimeout(t);
  }, [state, router]);

  const goToMyAppointments = () => router.push('/patient/appointments');

  const doctor = appointment?.doctor || null;
  const patient = appointment?.patient || null;
  const amount = appointment?.amountPaid || 349;
  const timeSlot = appointment?.timeSlot || 'Your scheduled time';

  // Appointment call window — patients may enter the room from 5 minutes before
  // the booked slot until the slot duration has elapsed.
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
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <span className="font-black text-2xl tracking-tight text-blue-800">
              City<span className="text-blue-600">Doctor</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">
              bKash Payment Gateway
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#e2136e] text-white text-[10px] font-extrabold tracking-wider">
              bKash PGW
            </span>
          </div>
        </div>
      </header>

      {/* Main Status Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        {state === 'verifying' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-12 text-center max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
              <Loader2 className="w-9 h-9 animate-spin" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Verifying bKash Payment</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Communicating with bKash secure servers and finalizing your consultation booking. Please do not close or refresh this page.
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Payment ID:</span>
                <span className="font-mono font-bold text-slate-700 truncate max-w-[180px]">
                  {paymentID}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Security Check:</span>
                <span className="text-emerald-600 font-bold">HMAC Encrypted</span>
              </div>
            </div>
          </div>
        )}

        {state === 'success' && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6 sm:p-10 text-center max-w-lg w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wide">
                bKash Payment Verified
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-2">Consultation Confirmed!</h1>
              <p className="text-xs text-slate-500 mt-1">
                Your payment with bKash was processed successfully.{' '}
                {winStatus === 'open' || !appointment
                  ? 'You can enter the consultation room now.'
                  : 'You can call the doctor from 5 minutes before your booked slot.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-400 font-medium">Transaction ID (TrxID)</span>
                <span className="font-mono font-black text-slate-900 text-sm">
                  {trxID}
                </span>
              </div>

              {doctor && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Doctor</div>
                    <div className="font-bold text-slate-900 text-sm truncate">{doctor.name}</div>
                    <div className="text-[11px] text-blue-600">{doctor.specialty}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Patient</div>
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {patient?.name || appointment?.patientName}
                  </div>
                  {appointment?.patientPhone && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {appointment.patientPhone}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Scheduled Slot</div>
                  <div className="font-bold text-slate-900">{timeSlot}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-600">Total Paid (bKash):</span>
                <span className="text-slate-900 text-base">৳{amount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={goToMyAppointments}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>View My Appointments</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {winStatus === 'open' || !appointment ? (
                <Link
                  href={`/consultation/${appointment?.id || ''}`}
                  className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-700/20 active:scale-98 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Video Consultation Room</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : winStatus === 'not_started' ? (
                <>
                  <button
                    type="button"
                    disabled
                    className="w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Call opens at {callOpensLabel}</span>
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
                  className="w-full py-3.5 rounded-xl bg-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <Clock className="w-4 h-4" />
                  <span>This consultation slot has ended</span>
                </button>
              )}

              {appointment?.id && (
                <Link
                  href={`/prescription/${appointment.id}`}
                  className="w-full py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>View &amp; Download Digital Prescription</span>
                </Link>
              )}

              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}

        {(state === 'failed' || state === 'cancelled') && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 sm:p-10 text-center max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ${
                state === 'cancelled'
                  ? 'bg-amber-100 text-amber-600 ring-amber-50'
                  : 'bg-red-100 text-red-600 ring-red-50'
              }`}
            >
              {state === 'cancelled' ? (
                <AlertTriangle className="w-9 h-9" />
              ) : (
                <XCircle className="w-9 h-9" />
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">
                {state === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {errorMessage ||
                  (state === 'cancelled'
                    ? 'You chose not to complete the bKash payment.'
                    : 'The transaction was declined or an error occurred during verification.')}
              </p>
            </div>

            {paymentID && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Reference ID:</span>
                  <span className="font-mono text-slate-700 font-bold">{paymentID}</span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={goToMyAppointments}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Go to My Appointments</span>
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-700/20 active:scale-98 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Checkout &amp; Try Again</span>
              </button>

              <Link
                href="/"
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 text-center border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>bKash Authorized Direct Merchant Payment Gateway</span>
        </div>
      </footer>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Verifying bKash response...</p>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

