'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  History,
  LogOut,
  Users,
  Video,
  Loader2,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Wallet,
  Search,
  Camera,
  FileText,
  CheckCircle2,
  X,
  Bell,
} from 'lucide-react';
import { IncomingCallModal } from '@/components/doctor/IncomingCallModal';
import { PrescriptionPreviewModal } from '@/components/doctor/PrescriptionPreviewModal';
import { playRingtone, stopRingtone } from '@/utils/ringtone';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
} from '@/lib/timeSlot';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const bdt = (n: number) =>
  `৳${(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

export default function DoctorDashboardPage() {
  const router = useRouter();

  // ---- Portal data (strictly isolated on the server via doctor session) ----
  const [doctor, setDoctor] = useState<any | null>(null);
  const [queue, setQueue] = useState<any[]>([]); // today's appointment queue
  const [upcoming, setUpcoming] = useState<any[]>([]); // future scheduled bookings (from tomorrow on)
  const [history, setHistory] = useState<any[]>([]); // completed patient history
  const [stats, setStats] = useState<any>({
    todayAppointments: 0,
    totalPatientsTreated: 0,
    totalEarnings: 0,
    paidConsultations: 0,
    consultationFee: 0,
    earningsPerConsult: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // ---- Tabs & history search ----
  const [activeTab, setActiveTab] = useState<'queue' | 'upcoming' | 'history'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [prescriptionAppt, setPrescriptionAppt] = useState<any | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]); // missed calls while offline

  // ---- Availability toggle ----
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ---- Real-time incoming call state ----
  const [incomingEvent, setIncomingEvent] = useState<any | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Auto-hide transient success notice
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  // ---- Session & dashboard data loading ----
  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      try {
        const res = await fetch('/api/doctor/dashboard');
        const data = await res.json();
        if (!data.success || !data.authenticated) {
          router.replace('/doctor/login');
          return;
        }
        setDoctor(data.doctor);
        setQueue(data.todayAppointments || []);
        setUpcoming(data.upcomingAppointments || []);
        setHistory(data.history || []);
        setStats(data.stats || stats);
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
        setIsAuthChecked(true);
      }
    },
    [router]
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Silently keep the queue fresh while the portal is open
  useEffect(() => {
    if (!doctor?.id) return;
    const id = setInterval(() => loadDashboard(true), 45000);
    return () => clearInterval(id);
  }, [doctor?.id, loadDashboard]);

  // ---- Real-time notification polling (every 4 seconds) ----
  useEffect(() => {
    if (!doctor?.id) return;

    let cancelled = false;

    const pollEvents = async () => {
      try {
        const res = await fetch(`/api/consultation/events?doctorId=${doctor.id}`);
        const data = await res.json();
        if (cancelled || !data.success || data.count === 0) return;

        const event = data.events[0];
        if (event && !incomingEvent) {
          setIncomingEvent(event);
          playRingtone();
        }
      } catch (err) {
        console.error('Error polling call events:', err);
      }
    };

    pollEvents();
    const interval = setInterval(pollEvents, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      stopRingtone();
    };
  }, [doctor?.id, incomingEvent]);
  // ---- Availability toggle (PUT /api/doctor/status) ----
  const handleToggleOnline = async () => {
    if (!doctor || isStatusUpdating) return;
    const next = !doctor.isOnline;
    setIsStatusUpdating(true);
    setStatusError(null);
    try {
      const res = await fetch('/api/doctor/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update availability');
      }
      setDoctor((prev: any) => ({ ...prev, isOnline: data.doctor.isOnline }));
      setNotice(
        data.doctor.isOnline
          ? 'You are now ONLINE — the “Active Online” badge on the public website is live.'
          : 'You are now OFFLINE — patients can still book scheduled slots.'
      );
    } catch (err: any) {
      console.error('Error toggling availability:', err);
      setStatusError(err.message || 'Failed to update availability');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // ---- Local profile photo upload ----
  const handlePhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !doctor) return;

    setIsPhotoUploading(true);
    setStatusError(null);
    try {
      // 1) Upload the local image file
      const fd = new FormData();
      fd.append('file', file);
      const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
      const upData = await upRes.json();
      if (!upRes.ok || !upData.success) {
        throw new Error(upData.error || 'Upload failed');
      }

      // 2) Persist the returned /uploads URL on the doctor's own profile
      const pfRes = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: upData.url }),
      });
      const pfData = await pfRes.json();
      if (!pfRes.ok || !pfData.success) {
        throw new Error(pfData.error || 'Profile update failed');
      }

      setDoctor((prev: any) => ({ ...prev, image: upData.url }));
      setNotice('Profile photo updated successfully.');
    } catch (err: any) {
      console.error('Error uploading profile photo:', err);
      setStatusError(err.message || 'Photo upload failed');
    } finally {
      setIsPhotoUploading(false);
    }
  };

  // ---- Consultation actions ----
  const handleAcceptCall = async () => {
    if (!incomingEvent) return;
    stopRingtone();
    setIsAccepting(true);
    try {
      await fetch(`/api/consultation/events/${incomingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true, type: 'CALL_ACCEPTED' }),
      });
      const appointmentId = incomingEvent.appointmentId || incomingEvent.appointment?.id;
      router.push(`/consultation/${appointmentId}?role=doctor&autoconnect=1`);
    } catch (err) {
      console.error('Error accepting call:', err);
      setIsAccepting(false);
    }
  };

  const handleDeclineCall = async () => {
    stopRingtone();
    if (incomingEvent) {
      try {
        await fetch(`/api/consultation/events/${incomingEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });
      } catch (err) {
        console.error('Error declining call:', err);
      }
    }
    setIncomingEvent(null);
  };

  const handleLogout = async () => {
    await fetch('/api/doctor/logout', { method: 'POST' });
    router.replace('/doctor/login');
    router.refresh();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboard();
    setIsRefreshing(false);
  };

  // Mark missed-call notifications as read (all, or specific ids).
  const handleDismissNotifications = async (ids?: string[]) => {
    try {
      const res = await fetch('/api/doctor/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: ids }),
      });
      if (!res.ok) return;
      if (ids?.length) {
        setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Error dismissing notifications:', err);
    }
  };

  // ---- Helpers ----
  // Booking/window classification shared by the queue tables:
  //   - COMPLETED / CANCELLED are terminal — they never offer a join action.
  //   - CONFIRMED inside its active window (slot −5 min → slot + duration)
  //     is joinable.
  //   - CONFIRMED in the future is "upcoming" (shows a disabled "Opens at …").
  //   - anything whose window has passed is "ended".
  const windowStateOf = (appt: any) => {
    if (appt?.status === 'COMPLETED' || appt?.status === 'CANCELLED') return 'closed';
    if (!appt?.scheduledAt && !appt?.timeSlot) return 'open'; // immediate/flex slot
    const win = getConsultationWindow(
      appt.scheduledAt,
      appt.timeSlot,
      appt.doctor?.slotDuration || 15
    );
    return getConsultationWindowStatus(win);
  };

  const canJoin = (appt: any) =>
    appt?.status === 'CONFIRMED' && windowStateOf(appt) === 'open';

  const joinIn = (appt: any) => {
    if (!appt?.scheduledAt) return null;
    const scheduled = new Date(appt.scheduledAt).getTime();
    const diff = scheduled - FIVE_MINUTES_MS - Date.now();
    if (diff <= 0) return null;
    return Math.ceil(diff / 60000);
  };

  const formatSlot = (appt: any) => {
    if (appt.timeSlot) return appt.timeSlot;
    if (!appt.scheduledAt) return '—';
    const d = new Date(appt.scheduledAt);
    return `${d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Extract a clean clock string ("10:00 AM") from either the human-readable
  // timeSlot or the scheduledAt timestamp. Used for the disabled "Join Call"
  // buttons that read "Opens at [time]".
  const formatClock = (appt: any) => {
    if (!appt) return 'slot time';
    if (appt.timeSlot) {
      const m = String(appt.timeSlot).match(/(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/i);
      if (m) {
        const suffix = (m[3] || '').toUpperCase();
        return `${m[1]}:${m[2]}${suffix ? ` ${suffix}` : ''}`;
      }
    }
    if (appt.scheduledAt) {
      const d = new Date(appt.scheduledAt);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
    }
    return 'slot time';
  };

  const formatDate = (d?: string | Date) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const patientNameOf = (appt: any) =>
    appt?.patient?.name || appt?.patientName || 'Unknown Patient';

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((appt) => {
      const name = patientNameOf(appt).toLowerCase();
      const phone = (appt.patient?.phone || appt.patientPhone || '').toLowerCase();
      const slot = (appt.timeSlot || '').toLowerCase();
      const date = formatDate(appt.scheduledAt).toLowerCase();
      return name.includes(q) || phone.includes(q) || slot.includes(q) || date.includes(q);
    });
  }, [history, searchQuery]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-3" />
        <h3 className="font-bold text-base text-slate-100">Loading Doctor Portal...</h3>
        <p className="text-xs text-slate-500 mt-1">Verifying session &amp; syncing today&apos;s queue</p>
      </div>
    );
  }

  if (isAuthChecked && !doctor) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h3 className="font-bold text-lg text-slate-100">Not Authenticated</h3>
        <p className="text-xs text-slate-400 mt-1">Please sign in to access the doctor portal.</p>
        <Link
          href="/doctor/login"
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const isOnline = doctor?.isOnline !== false;

  const todayQueue = queue.filter((a) => a.status !== 'COMPLETED');
  const completedToday = queue.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-base tracking-tight bg-gradient-to-r from-teal-300 to-cyan-200 bg-clip-text text-transparent hidden sm:inline">
                CityDoctor
              </span>
            </Link>
            <span
              className={`hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-bold border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              {isOnline ? 'Active Online' : 'Offline'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {doctor?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-teal-500/40"
              />
            )}
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-100 truncate max-w-[160px]">
                {doctor?.name}
              </div>
              <div className="text-[10px] text-teal-400">{doctor?.specialty}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Welcome back, {doctor?.name?.replace(/^Dr\.?\s*/i, '') || 'Doctor'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              • Your consultations, patient history &amp; earnings at a glance.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Transient success notice */}
        {notice && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            {notice}
          </div>
        )}

        {/* Missed calls while offline — stored when a patient called but the
            doctor was OFFLINE (no real-time incoming-call modal was fired). */}
        {notifications.length > 0 && (
          <div className="rounded-2xl bg-amber-950/50 border border-amber-500/30 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">
                    Missed call requests while offline
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Patients called during their slot but you were offline — an SMS alert was
                    logged and no call modal was shown.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDismissNotifications()}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors"
              >
                Dismiss all
              </button>
            </div>
            <ul className="divide-y divide-amber-500/10 max-h-56 overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 text-xs text-amber-100/90">
                    <div className="leading-relaxed">{n.message}</div>
                    {n.appointment?.timeSlot && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Slot: {n.appointment.timeSlot}
                      </div>
                    )}
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissNotifications([n.id])}
                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}


        {/* ============ TOP STATUS BAR: Online/Offline toggle + profile photo ============ */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-5 sm:p-6 transition-colors duration-300 ${
            isOnline
              ? 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900'
              : 'border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Doctor identity + photo upload */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-800">
                  {doctor?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doctor.image}
                      alt={doctor.name || 'Doctor'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-500">
                      {doctor?.name?.charAt(0) || 'D'}
                    </div>
                  )}
                  {isPhotoUploading && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-teal-500/30 transition-colors border-2 border-slate-950"
                  title="Upload profile photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoFile}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-100 truncate">
                    Dr. {doctor?.name?.replace(/^Dr\.?\s*/i, '') || 'Doctor'}
                  </h2>
                  {doctor?.isVerified && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-teal-300 mt-0.5">
                  {doctor?.designation || doctor?.specialty || 'Consultant'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {doctor?.hospital} • {doctor?.specialties?.split(',')[0]?.trim()}
                </p>
              </div>
            </div>


            {/* Availability switch */}
            <div className="flex items-center gap-4 lg:gap-5 shrink-0">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span
                    className={`text-sm font-extrabold ${
                      isOnline ? 'text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 max-w-[190px]">
                  {isOnline
                    ? 'Patients see the “Active Online” badge & can start instant video calls.'
                    : 'You are hidden from instant consult — scheduled bookings stay open.'}
                </p>
              </div>

              <button
                role="switch"
                aria-checked={isOnline}
                aria-label="Toggle online / offline availability"
                onClick={handleToggleOnline}
                disabled={isStatusUpdating}
                className={`relative w-16 h-9 rounded-full transition-colors duration-300 shrink-0 ${
                  isOnline ? 'bg-emerald-500' : 'bg-slate-700'
                } ${isStatusUpdating ? 'opacity-60 cursor-wait' : 'cursor-pointer'}`}
              >
                <span
                  className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300 ${
                    isOnline ? 'left-8' : 'left-1'
                  }`}
                />
              </button>

              <div className="hidden xl:flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">
                  {isStatusUpdating ? 'Saving…' : 'Status'}
                </span>
                <span
                  className={`text-sm font-black flex items-center gap-1.5 ${
                    isOnline ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {isStatusUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>
          </div>

          {statusError && (
            <div className="mt-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-[11px] flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {statusError}
            </div>
          )}
        </div>


        {/* ============ STATS CARDS ============ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Today's Appointments */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden relative">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <CalendarCheck className="w-3.5 h-3.5 text-teal-400" />
                  Today&apos;s Appointments
                </div>
                <div className="text-3xl font-extrabold text-teal-400 mt-2">
                  {stats.todayAppointments ?? 0}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {todayQueue.length} waiting now • {completedToday.length} completed today
            </p>
          </div>

          {/* Patients Treated (Lifetime) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Patients Treated
                </div>
                <div className="text-3xl font-extrabold text-blue-400 mt-2">
                  {stats.totalPatientsTreated ?? 0}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              Lifetime completed consultations
            </p>
          </div>

          {/* Total Earnings */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  Total Earnings
                </div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2">
                  {bdt(stats.totalEarnings ?? 0)}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              {bdt(stats.earningsPerConsult ?? stats.consultationFee ?? 0)} earned per paid
              consultation — full Consultation Fee, no split
            </p>
          </div>
        </div>


        {/* ============ TABS ============ */}
        <div className="flex items-center gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'queue'
                ? 'bg-slate-900/80 text-teal-300 border-teal-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <Video className="w-4 h-4" />
            Today&apos;s Queue
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-black text-slate-300">
              {todayQueue.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'upcoming'
                ? 'bg-slate-900/80 text-teal-300 border-teal-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Upcoming Appointments
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-black text-slate-300">
              {upcoming.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs font-bold flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'history'
                ? 'bg-slate-900/80 text-teal-300 border-teal-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            <History className="w-4 h-4" />
            Patient History
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-black text-slate-300">
              {history.length}
            </span>
          </button>
        </div>

        {/* ============ TODAY'S QUEUE TAB ============ */}
        {activeTab === 'queue' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">
                    Today&apos;s Appointments Queue
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Video calls can be joined from 5 minutes before the booked slot.
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/25 font-bold self-start sm:self-auto">
                {todayQueue.length} waiting • {completedToday.length} done
              </span>
            </div>


            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Booked Time Slot</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {queue.length > 0 ? (
                    queue.map((appt) => {
                      const joinable = canJoin(appt);
                      const minutesUntilJoin = joinIn(appt);
                      const displayName = patientNameOf(appt);
                      const isDone = appt.status === 'COMPLETED';
                      const isCancelled = appt.status === 'CANCELLED';
                      const isUpcoming =
                        appt.status === 'CONFIRMED' &&
                        windowStateOf(appt) === 'not_started';
                      const payStatus = appt.paymentStatus || 'UNPAID';
                      return (
                        <tr key={appt.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Patient */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                {displayName.trim().charAt(0).toUpperCase()}
                              </span>
                              <span>{displayName}</span>
                            </div>
                            {(appt.patient?.phone || appt.patientPhone) && (
                              <div className="text-[10px] text-slate-500 mt-0.5 pl-7">
                                {appt.patient?.phone || appt.patientPhone}
                              </div>
                            )}
                          </td>

                          {/* Time slot */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-200">
                              {formatSlot(appt)}
                            </div>
                            {appt.symptoms && (
                              <div className="text-[10px] text-slate-500 mt-0.5 max-w-[220px] truncate">
                                {appt.symptoms}
                              </div>
                            )}
                          </td>

                          {/* Payment / booking status */}
                          <td className="py-3 px-4">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Completed
                              </span>
                            ) : isCancelled ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                                Cancelled
                              </span>
                            ) : isUpcoming ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30 font-bold text-[10px]">
                                Upcoming
                              </span>
                            ) : payStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Paid
                                {appt.amountPaid ? ` • ${bdt(appt.amountPaid)}` : ''}
                              </span>
                            ) : payStatus === 'REFUNDED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                                Refunded
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                                {payStatus === 'PENDING' ? 'Pending' : 'Unpaid'}
                              </span>
                            )}
                          </td>


                          {/* Action */}
                          <td className="py-3 px-4 text-right">
                            {isDone ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" /> Handled
                              </span>
                            ) : isCancelled ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" /> Cancelled
                              </span>
                            ) : joinable ? (
                              <Link
                                href={`/consultation/${appt.id}?role=doctor`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-[11px] shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Join Video Call
                              </Link>
                            ) : isUpcoming ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold cursor-not-allowed"
                                title={
                                  minutesUntilJoin !== null
                                    ? `Join Call opens in ~${minutesUntilJoin} minutes`
                                    : 'Join Call is disabled until the booked slot'
                                }
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Join Call — Opens at {formatClock(appt)}
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold cursor-not-allowed"
                                title="The consultation window for this booking has ended"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                Window ended
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500">
                        <Video className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                        No appointments scheduled today. New bookings will appear here in real time.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ UPCOMING APPOINTMENTS TAB ============ */}
        {activeTab === 'upcoming' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">Upcoming Appointments</h2>
                  <p className="text-[11px] text-slate-500">
                    {upcoming.length} future booked consultation{upcoming.length === 1 ? '' : 's'} shown
                    chronologically — Join Call unlocks automatically at the booked slot time.
                  </p>
                </div>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/25 font-bold self-start sm:self-auto">
                {upcoming.length} upcoming
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Booked Slot</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {upcoming.length > 0 ? (
                    upcoming.map((appt) => {
                      const displayName = patientNameOf(appt);
                      const payStatus = appt.paymentStatus || 'UNPAID';
                      const scheduled = appt.scheduledAt ? new Date(appt.scheduledAt) : null;
                      return (
                        <tr key={appt.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Patient */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-violet-500/15 text-violet-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                {displayName.trim().charAt(0).toUpperCase()}
                              </span>
                              <span>{displayName}</span>
                            </div>
                            {(appt.patient?.phone || appt.patientPhone) && (
                              <div className="text-[10px] text-slate-500 mt-0.5 pl-7">
                                {appt.patient?.phone || appt.patientPhone}
                              </div>
                            )}
                          </td>

                          {/* Booked slot */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-[11px] text-slate-200">
                              {appt.timeSlot || formatSlot(appt)}
                            </div>
                            {scheduled && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {scheduled.toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                            )}
                          </td>

                          {/* Payment status */}
                          <td className="py-3 px-4">
                            {payStatus === 'PAID' ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3" /> Paid
                                {appt.amountPaid ? ` • ${bdt(appt.amountPaid)}` : ''}
                              </span>
                            ) : payStatus === 'REFUNDED' ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                                Refunded
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
                                {payStatus === 'PENDING' ? 'Pending' : 'Unpaid'}
                              </span>
                            )}
                          </td>
                          {/* Action — Join Call unlocks at the booked slot */}
                          <td className="py-3 px-4 text-right">
                            {appt.status === 'COMPLETED' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold">
                                <Clock className="w-3.5 h-3.5" /> Completed
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold cursor-not-allowed"
                                title="The Join Call button unlocks automatically at the booked slot time"
                              >
                                <Video className="w-3.5 h-3.5" />
                                Join Call — Opens at {formatClock(appt)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-14 text-center text-slate-500">
                        <CalendarDays className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                        No upcoming appointments. Future bookings will appear here chronologically.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ PATIENT HISTORY TAB ============ */}
        {activeTab === 'history' && (
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-100 text-sm">Patient History</h2>
                  <p className="text-[11px] text-slate-500">
                    {history.length} completed consultations with digital prescriptions
                  </p>
                </div>
              </div>

              {/* Search box */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient, phone or date…"
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Consulted On</th>
                    <th className="py-3 px-4">Diagnosis</th>
                    <th className="py-3 px-4 text-right">Digital Prescription</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">


                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((appt) => {
                      const displayName = patientNameOf(appt);
                      const rx = appt.prescription;
                      return (
                        <tr key={appt.id} className="hover:bg-slate-800/40 transition-colors">
                          {/* Patient */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span className="w-6 h-6 rounded-full bg-blue-500/15 text-blue-300 flex items-center justify-center text-[10px] font-black shrink-0">
                                {displayName.trim().charAt(0).toUpperCase()}
                              </span>
                              <span>{displayName}</span>
                            </div>
                            {(appt.patient?.phone || appt.patientPhone) && (
                              <div className="text-[10px] text-slate-500 mt-0.5 pl-7">
                                {appt.patient?.phone || appt.patientPhone}
                              </div>
                            )}
                          </td>

                          {/* Consulted on */}
                          <td className="py-3 px-4">
                            <div className="text-slate-200 font-medium">
                              {formatDate(appt.scheduledAt)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {appt.timeSlot || 'Completed consultation'}
                            </div>
                          </td>

                          {/* Diagnosis */}
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-slate-300 line-clamp-2 leading-relaxed">
                              {rx?.diagnosis || '—'}
                            </p>
                          </td>

                          {/* Prescription action */}
                          <td className="py-3 px-4 text-right">
                            {rx ? (
                              <button
                                onClick={() => setPrescriptionAppt(appt)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-[11px] transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                View Prescription
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 text-[11px] font-bold">
                                No prescription
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-14 text-center text-slate-500">
                        <History className="w-6 h-6 mx-auto text-slate-600 mb-2" />
                        {searchQuery
                          ? 'No completed consultations match your search.'
                          : 'No completed consultations yet. They will appear after you issue a digital prescription.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Strict data isolation • All /api/doctor/* requests are scoped to your signed doctor
            session (doctorId) so you only ever see your own patients &amp; appointments.
          </span>
        </div>


      </main>

      {/* Real-Time Incoming Call Modal */}
      <IncomingCallModal
        isOpen={!!incomingEvent}
        patientName={incomingEvent?.patientName || 'Patient'}
        doctorName={doctor?.name || ''}
        doctorImage={doctor?.image || null}
        timeSlot={incomingEvent?.appointment?.timeSlot || null}
        symptoms={incomingEvent?.appointment?.symptoms || null}
        isAccepting={isAccepting}
        onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
      />

      {/* Digital Prescription Viewer (Patient History tab) */}
      <PrescriptionPreviewModal
        open={!!prescriptionAppt}
        appt={prescriptionAppt}
        onClose={() => setPrescriptionAppt(null)}
      />
    </div>
  );
}


