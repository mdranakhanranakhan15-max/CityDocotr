'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  CalendarCheck,
  Clock,
  Loader2,
  LogOut,
  Stethoscope,
  CreditCard,
  Video,
  CheckCircle2,
  AlertCircle,
  FileText,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
} from '@/lib/timeSlot';

const bdt = (n?: number | null) =>
  `৳${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const slotLabel = (appt: any): string => {
  if (appt?.timeSlot) return appt.timeSlot;
  if (appt?.scheduledAt) {
    const d = new Date(appt.scheduledAt);
    if (!Number.isNaN(d.getTime())) {
      return `${d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })} • ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
  }
  return 'Flexible slot';
};

const clockLabel = (appt: any): string => {
  if (appt?.timeSlot) {
    const m = String(appt.timeSlot).match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
    if (m) return `${m[1]}:${m[2]}${m[3] ? ` ${String(m[3]).toUpperCase()}` : ''}`;
  }
  if (appt?.scheduledAt) {
    const d = new Date(appt.scheduledAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  }
  return 'slot time';
};

const BookingBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: {
      label: 'Confirmed',
      cls: 'text-emerald-700 border-emerald-200 bg-emerald-50',
    },
    PENDING: { label: 'Pending', cls: 'text-amber-700 border-amber-200 bg-amber-50' },
    COMPLETED: { label: 'Completed', cls: 'text-blue-700 border-blue-200 bg-blue-50' },
    CANCELLED: { label: 'Cancelled', cls: 'text-rose-700 border-rose-200 bg-rose-50' },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}
    >
      {status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
      {s.label}
    </span>
  );
};

export default function PatientAppointmentsPage() {
  const { currentUser, isLoading: authLoading, openAuthModal, logout } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  const loadAppointments = useCallback(async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/patient/appointments');
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data && data.authenticated === false) return; // session expired — auth gate below
        throw new Error(data?.error || 'Failed to load your appointments.');
      }
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load your appointments.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.id) loadAppointments();
  }, [currentUser?.id, loadAppointments]);

  // Keep the "Enter Video Room" slot-window check live while the page is open.
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const paidAppointments = appointments.filter((a) => a.paymentStatus === 'PAID');
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const upcomingAppointments = appointments.filter(
    (a) =>
      (a.status === 'CONFIRMED' || a.status === 'PENDING') &&
      a.scheduledAt &&
      new Date(a.scheduledAt).getTime() > Date.now()
  );
  const totalSpent = paidAppointments.reduce(
    (sum, a) => sum + (a.amountPaid || a.doctor?.consultationFee || 0),
    0
  );

  const windowStatusFor = (appt: any) => {
    if (appt?.status === 'COMPLETED' || appt?.status === 'CANCELLED') return 'closed';
    if (!appt?.scheduledAt && !appt?.timeSlot) return 'open';
    const win = getConsultationWindow(
      appt?.scheduledAt,
      appt?.timeSlot,
      appt?.doctor?.slotDuration || 15
    );
    return getConsultationWindowStatus(win, new Date(nowTs));
  };

  // ---- Auth gate: patient must be logged in ----
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500">Checking your account...</p>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Sign in to view your appointments</h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Your booked video consultations, receipts and prescriptions are stored on your
              patient account. Log in with your phone number to continue.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() =>
                openAuthModal({ isLoginView: true, redirectTo: '/patient/appointments' })
              }
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              Login / Sign Up
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold text-xs text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 select-none">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center shadow-md shadow-blue-700/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base tracking-tight text-blue-800 hidden sm:inline">
                CityDoctor
              </span>
            </Link>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold">
              <CalendarCheck className="w-3 h-3" />
              My Appointments
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-blue-600">{currentUser.phone}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page heading + summary chips */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">My Appointment History</h1>
            <p className="text-xs text-slate-500 mt-1">
              Every consultation you have booked with CityDoctor — payments, TrxIDs and video
              rooms, all in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold">
              {appointments.length} Bookings
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold">
              {upcomingAppointments.length} Upcoming
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold">
              {completedAppointments.length} Completed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold">
              <Wallet className="w-3.5 h-3.5" /> {bdt(totalSpent)} Paid
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {/* Content: loading / empty / list */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Loading your appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-20 rounded-2xl bg-white border border-slate-200 shadow-sm text-center text-slate-500 space-y-2">
            <CalendarDays className="w-12 h-12 mx-auto text-slate-400 mb-2" />
            <p className="text-base font-bold text-slate-900">No appointments yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              When you book a video consultation with a CityDoctor physician it will show up here
              with the slot time, payment receipt and TrxID.
            </p>
            <Link
              href="/#doctors"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
            >
              <Stethoscope className="w-4 h-4" /> Book a Consultation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const status = windowStatusFor(appt);
              const doctor = appt.doctor || {};
              const docName = doctor.name || 'CityDoctor Physician';
              const docInitial = (doctor.name || 'D').trim().charAt(0).toUpperCase();
              const isPaid = appt.paymentStatus === 'PAID';
              const canEnter = appt.status !== 'CANCELLED' && status === 'open';
              return (
                <div
                  key={appt.id}
                  className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden"
                >
                  {/* Top: doctor + status */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5 border-b border-slate-100">
                    {doctor.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={doctor.image}
                        alt={docName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white font-black text-base flex items-center justify-center shrink-0">
                        {docInitial}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm truncate">
                          {docName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase tracking-wider">
                          {doctor.specialty || 'General Physician'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-blue-600" />
                        {doctor.designation || 'Consultant'} • {doctor.hospital || 'CityDoctor Telehealth'}
                      </p>
                    </div>
                    <BookingBadge status={appt.status} />
                  </div>
                  {/* Middle: slot / fee / trx */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 divide-slate-100 text-xs">
                    <div className="p-4">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-violet-600" /> Scheduled Slot
                      </div>
                      <div className="font-mono text-[11px] text-slate-700">{slotLabel(appt)}</div>
                      {appt.status !== 'COMPLETED' && appt.status !== 'CANCELLED' && (
                        <div
                          className={`mt-1.5 text-[10px] font-semibold ${
                            status === 'open'
                              ? 'text-emerald-600'
                              : status === 'not_started'
                                ? 'text-amber-600'
                                : 'text-slate-400'
                          }`}
                        >
                          {status === 'open'
                            ? 'Video room is open now'
                            : status === 'not_started'
                              ? `Opens at ${clockLabel(appt)}`
                              : 'Consultation window ended'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Fee Paid
                      </div>
                      <div className="font-mono font-bold text-emerald-600 text-sm">
                        {bdt(appt.amountPaid ?? doctor.consultationFee)}
                      </div>
                      <div
                        className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          isPaid
                            ? 'text-emerald-700 border-emerald-200 bg-emerald-50'
                            : appt.paymentStatus === 'REFUNDED'
                              ? 'text-rose-700 border-rose-200 bg-rose-50'
                              : 'text-amber-700 border-amber-200 bg-amber-50'
                        }`}
                      >
                        {isPaid && <CheckCircle2 className="w-3 h-3" />}
                        {appt.paymentStatus || 'UNPAID'}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1.5 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" /> TrxID
                      </div>
                      {appt.transactionId ? (
                        <div className="font-mono text-[11px] text-slate-700 break-all">
                          {appt.transactionId}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">—</div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-1.5">
                        {appt.paymentMethod === 'CARD' ? 'Card' : appt.paymentMethod === 'BKASH' ? 'bKash' : '—'} payment
                      </div>
                    </div>
                  </div>
                  {/* Bottom: action */}
                  <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      {appt.status === 'CANCELLED' ? (
                        'This booking was cancelled.'
                      ) : appt.status === 'COMPLETED' ? (
                        'Consultation completed.'
                      ) : (
                        <>
                          Slot: <span className="text-slate-700 font-semibold">{slotLabel(appt)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {appt.status === 'COMPLETED' ? (
                        <Link
                          href={`/prescription/${appt.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 text-xs font-bold shadow-sm transition-colors"
                        >
                          <FileText className="w-4 h-4" /> View Prescription
                        </Link>
                      ) : appt.status === 'CANCELLED' ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 text-xs font-bold cursor-not-allowed">
                          <Clock className="w-4 h-4" /> Cancelled
                        </span>
                      ) : canEnter ? (
                        <Link
                          href={`/consultation/${appt.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                        >
                          <Video className="w-4 h-4" /> Enter Video Room
                        </Link>
                      ) : (
                        <span
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-400 border border-slate-200 text-xs font-bold cursor-not-allowed"
                          title={
                            status === 'not_started'
                              ? 'The video room opens at your booked slot time'
                              : 'The consultation window for this booking has ended'
                          }
                        >
                          <Clock className="w-4 h-4" />
                          {status === 'not_started'
                            ? `Enter Video Room — Opens at ${clockLabel(appt)}`
                            : 'Session window ended'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
        {/* Security + tip footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[11px] text-slate-500 px-1 pt-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <Video className="w-3.5 h-3.5 text-blue-600" />
            Enter Video Room unlocks automatically 5 minutes before your slot and stays open for
            the consultation duration.
          </span>
          <span className="sm:ml-auto inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            End-to-end encrypted consultations
          </span>
        </div>
    </div>
  );
}

