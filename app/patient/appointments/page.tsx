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
  Settings,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getAppointmentSlotInfo,
  type AppointmentSlotInfo,
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
    UPCOMING: {
      label: 'Upcoming',
      cls: 'text-amber-700 border-amber-200 bg-amber-50',
    },
    CONFIRMED: {
      label: 'Confirmed',
      cls: 'text-teal-700 border-teal-200 bg-teal-50',
    },
    PENDING: { label: 'Pending', cls: 'text-amber-700 border-amber-200 bg-amber-50' },
    COMPLETED: { label: 'Session Completed', cls: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    CANCELLED: { label: 'Cancelled', cls: 'text-slate-600 border-slate-200 bg-slate-100' },
    TIMED_OUT: {
      label: 'Window Ended',
      cls: 'text-rose-700 border-rose-200 bg-rose-50',
    },
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

  // Standardised window/timeout decision (see lib/timeSlot.ts):
  //   COMPLETED / CANCELLED → terminal badges, never a call action
  //   slot −5m → slot +15m & CONFIRMED → "Enter Video Room"
  //   before slot −5m → "Upcoming" (disabled "Opens at …")
  //   after slot +15m without COMPLETED → "Window Ended"
  const slotInfoFor = (appt: any): AppointmentSlotInfo =>
    getAppointmentSlotInfo(appt, new Date(nowTs));

  // ---- Auth gate: patient must be logged in ----
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-xs font-semibold text-slate-500">Checking your account...</p>
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto">
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
              className="flex-1 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20"
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/25 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base tracking-tight text-slate-900 hidden sm:inline">
                City<span className="text-teal-600">Doctor</span>
              </span>
            </Link>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 font-bold">
              <CalendarCheck className="w-3 h-3" />
              My Appointments
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-right">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0 ring-2 ring-white shadow-sm">
                {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-teal-600">{currentUser.phone}</div>
              </div>
            </div>
            <Link
              href="/patient/settings"
              className="p-2.5 rounded-xl bg-white hover:bg-teal-50 text-slate-500 hover:text-teal-600 border border-slate-200 transition-colors shadow-sm"
              title="Account Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>
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
            <span className="px-2.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-bold">
              {appointments.length} Bookings
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11px] font-bold">
              {upcomingAppointments.length} Upcoming
            </span>
            <span className="px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold">
              {completedAppointments.length} Completed
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[11px] font-bold">
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
            <Loader2 className="w-9 h-9 animate-spin text-teal-600" />
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
              href="/department/all"
              className="inline-flex items-center gap-2 mt-3 px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm shadow-teal-600/20"
            >
              <Stethoscope className="w-4 h-4" /> Browse Doctors &amp; Book a Consultation
            </Link>
          </div>
        ) : (
          <div className="relative pl-8 sm:pl-10">
            <div
              className="absolute left-[11px] sm:left-[13px] top-2 bottom-2 w-0.5 rounded-full bg-gradient-to-b from-teal-400 via-slate-200 to-slate-200 dark:from-teal-500 dark:via-slate-700 dark:to-slate-700"
              aria-hidden
            />
            <div className="space-y-5">
              {appointments.map((appt) => {
                const slotInfo = slotInfoFor(appt);
                const slotState = slotInfo.state;
                const isCompleted = slotState === 'COMPLETED';
                const isCancelled = slotState === 'CANCELLED';
                const isTimedOut = slotState === 'TIMED_OUT';
                const isUpcoming = slotState === 'UPCOMING';
                const canEnter = slotState === 'ACTIVE';
                const doctor = appt.doctor || {};
                const docName = doctor.name || 'CityDoctor Physician';
                const docInitial = (doctor.name || 'D').trim().charAt(0).toUpperCase();
                const isPaid = appt.paymentStatus === 'PAID';
                const isLive = canEnter || isUpcoming;
                const bookingBadgeStatus = isUpcoming
                  ? 'UPCOMING'
                  : isTimedOut
                    ? 'TIMED_OUT'
                    : appt.status;
                const nodeTone = canEnter
                  ? 'bg-emerald-500 text-white ring-emerald-200 shadow-emerald-500/40'
                  : isUpcoming
                    ? 'bg-amber-400 text-white ring-amber-100'
                    : isCompleted
                      ? 'bg-teal-600 text-white ring-teal-100'
                      : isCancelled
                        ? 'bg-rose-500 text-white ring-rose-100'
                        : 'bg-slate-300 text-slate-100 ring-slate-100';
                return (
                  <div key={appt.id} className="relative">
                    <div
                      className={`absolute -left-8 sm:-left-10 top-3 w-6 h-6 rounded-full ring-4 shadow-lg flex items-center justify-center ${nodeTone}`}
                    >
                      {canEnter ? (
                        <Video className="w-3 h-3" />
                      ) : isUpcoming ? (
                        <Clock className="w-3 h-3" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                    </div>


                    {isLive ? (
                      <div
                        className={`rounded-3xl overflow-hidden border bg-white transition-shadow duration-300 ${
                          canEnter
                            ? 'border-teal-400/70 shadow-[0_18px_55px_-16px_rgba(16,185,129,0.45)] ring-4 ring-teal-400/10'
                            : 'border-amber-200/80 shadow-xl shadow-amber-500/10'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {doctor.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={doctor.image}
                                alt={docName}
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shrink-0 shadow-sm"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-500 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                                {docInitial}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-slate-900 text-sm truncate">
                                  {docName}
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[9px] font-bold uppercase tracking-wider">
                                  {doctor.specialty || 'General Physician'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <Stethoscope className="w-3 h-3 text-teal-600" />
                                {doctor.designation || 'Consultant'} •{' '}
                                {doctor.hospital || 'CityDoctor Telehealth'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {canEnter && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                Open now
                              </span>
                            )}
                            <BookingBadge status={bookingBadgeStatus} />
                          </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 px-4 sm:px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 text-xs">
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1 mb-1">
                              <CalendarDays className="w-3.5 h-3.5 text-teal-600" /> Scheduled Slot
                            </div>
                            <div className="font-mono text-[11px] text-slate-700">{slotLabel(appt)}</div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1 mb-1">
                              <Wallet className="w-3.5 h-3.5 text-emerald-600" /> Fee Paid
                            </div>
                            <div className="font-mono font-bold text-emerald-600 text-sm">
                              {bdt(appt.amountPaid ?? doctor.consultationFee)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1 mb-1">
                              <CreditCard className="w-3.5 h-3.5 text-teal-600" /> TrxID
                            </div>
                            <div className="font-mono text-[11px] text-slate-700 break-all">
                              {appt.transactionId || '—'}
                            </div>
                          </div>
                        </div>

                        {/* Prominent action block */}
                        <div className="border-t border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-[11px] text-slate-500">
                            {canEnter ? (
                              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                Your video room is open — tap to join your doctor now.
                              </span>
                            ) : (
                              <>
                                Room unlocks at{' '}
                                <span className="font-mono font-bold text-slate-700">
                                  {clockLabel(appt)}
                                </span>{' '}
                                (5 min before your slot) and stays open for 15 minutes after.
                              </>
                            )}
                          </div>
                          {canEnter ? (
                            <Link
                              href={`/consultation/${appt.id}`}
                              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-teal-600/30 active:scale-[0.98] transition-all"
                            >
                              <Video className="w-5 h-5" />
                              Enter Video Room
                            </Link>
                          ) : (
                            <span
                              className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold"
                              title="The video room opens at your booked slot time"
                            >
                              <Clock className="w-4 h-4" />
                              {`Opens at ${clockLabel(appt)}`}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (


                      /* ===== PAST · COMPACT MUTED CARD ===== */
                      <div className="rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm shadow-sm px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:border-slate-300 transition-colors">
                        {doctor.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={doctor.image}
                            alt={docName}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 opacity-80"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 font-bold flex items-center justify-center shrink-0 border border-slate-200">
                            {docInitial}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[13px] font-bold text-slate-700 truncate">
                              {docName}
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[8px] font-bold uppercase tracking-wider">
                              {doctor.specialty || 'General Physician'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" />
                            {slotLabel(appt)}
                            {isPaid && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="font-mono font-semibold text-emerald-600">
                                  {bdt(appt.amountPaid ?? doctor.consultationFee)}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <BookingBadge status={bookingBadgeStatus} />
                          {isCompleted && (
                            <Link
                              href={`/prescription/${appt.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 text-[10px] font-bold shadow-sm transition-colors"
                              title="View Prescription"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Prescription</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
        {/* Security + tip footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-[11px] text-slate-500 px-1 pt-2">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-500">
            <Video className="w-3.5 h-3.5 text-teal-600" />
            Enter Video Room unlocks automatically 5 minutes before your slot and stays open for
            15 minutes after your scheduled time.
          </span>
          <span className="sm:ml-auto inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            End-to-end encrypted consultations
          </span>
        </div>
    </div>
  );
}

