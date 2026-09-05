'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  Stethoscope,
  Send,
  PhoneOff,
  Activity,
  KeyRound,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* ZegoCloud configuration (ZegoUIKitPrebuilt)                          */
/* A ZegoCloud AppID + Server Secret are required to generate the kit   */
/* token. They are consumed in the browser, so both env vars must be    */
/* prefixed NEXT_PUBLIC_. Create a project at console.zegocloud.com to  */
/* obtain them (AppID = number, Server Secret = string).                */
/* ------------------------------------------------------------------ */
const ZEGO_APP_ID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID || 0);
const ZEGO_SERVER_SECRET = String(
  process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || ''
).trim();
const ZEGO_IS_CONFIGURED = ZEGO_APP_ID > 0 && ZEGO_SERVER_SECRET.length > 0;

import {
  getConsultationWindow,
  getConsultationWindowStatus,
  minutesUntilConsultationOpens,
  formatConsultationTime,
} from '@/lib/timeSlot';
import type { ConsultationWindowStatus } from '@/lib/timeSlot';

type RoomPhase = 'loading' | 'ready' | 'call' | 'ended';
type RoomRole = 'patient' | 'doctor';

function ConsultationRoomContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = (params?.appointmentId as string) || '';

  const roleParam = searchParams.get('role');
  const autoConnect = searchParams.get('autoconnect') === '1';
  const role: RoomRole = roleParam === 'doctor' ? 'doctor' : 'patient';

  // --- Consultation context ---
  const [appointment, setAppointment] = useState<any | null>(null);
  const [doctor, setDoctor] = useState<any | null>(null);
  const [patient, setPatient] = useState<any | null>(null);
  const [phase, setPhase] = useState<RoomPhase>('loading');
  const [notFound, setNotFound] = useState(false);

  // --- Patient call initiation (slot-window gated) state ---
  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  const [isCallingDoctor, setIsCallingDoctor] = useState(false);
  const [dialNotice, setDialNotice] = useState<string | null>(null);
  const [dialError, setDialError] = useState<string | null>(null);

  // --- Live call state ---
  const [joined, setJoined] = useState(false);
  const [zegoError, setZegoError] = useState<string | null>(null);
  const [remoteLeft, setRemoteLeft] = useState(false);

  // --- Live prescription (doctor panel) state ---
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [tests, setTests] = useState('');
  const [advice, setAdvice] = useState('');
  const [isSavingRx, setIsSavingRx] = useState(false);
  const [rxSaved, setRxSaved] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const zpRef = useRef<any | null>(null);
  const initStartedRef = useRef(false);
  const joinedRef = useRef(false);
  const exitingRef = useRef(false);

  const patientName = patient?.name || appointment?.patientName || 'Patient';
  const doctorName = doctor?.name || appointment?.doctor?.name || 'Doctor';

  // Consultation slot window — patient may initiate the call from 5 minutes
  // before the scheduled slot until the slot duration has elapsed.
  const callWindow = (() => {
    const scheduledAt = appointment?.scheduledAt;
    const timeSlot = appointment?.timeSlot;
    if (!scheduledAt && !timeSlot) return null;
    return getConsultationWindow(
      scheduledAt,
      timeSlot,
      doctor?.slotDuration || appointment?.doctor?.slotDuration || 15
    );
  })();
  const windowStatus: ConsultationWindowStatus = callWindow
    ? getConsultationWindowStatus(callWindow, new Date(nowTs))
    : 'open'; // no scheduled slot (legacy direct doctor room) → no window restriction

  // Load the room: the param is an appointmentId, but older links may pass a
  // doctorId for a direct/instant doctor room - fall back gracefully.
  const loadRoom = useCallback(async () => {
    if (!appointmentId) {
      setNotFound(true);
      setPhase('ready');
      return;
    }
    setPhase('loading');
    try {
      const apptRes = await fetch(`/api/appointments/${appointmentId}`);
      const apptData = await apptRes.json();
      if (apptData.success && apptData.appointment) {
        const appt = apptData.appointment;
        setAppointment(appt);
        setDoctor(appt.doctor || null);
        setPatient(appt.patient || null);
        setPhase('ready');
        return;
      }

      // Fallback: the id is a doctor id (legacy direct/instant room).
      const docRes = await fetch(`/api/doctors/${appointmentId}`);
      const docData = await docRes.json();
      if (docData.success && docData.doctor) {
        setDoctor(docData.doctor);
        setPhase('ready');
        return;
      }

      setNotFound(true);
      setPhase('ready');
    } catch (err) {
      console.error('Error loading consultation room:', err);
      setNotFound(true);
      setPhase('ready');
    }
  }, [appointmentId]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Keep the slot-window clock fresh so the disabled "Call opens at ..."
  // button flips to an active "Call Doctor" button the moment the window opens.
  useEffect(() => {
    const id = setInterval(() => setNowTs(Date.now()), 20000);
    const onFocus = () => setNowTs(Date.now());
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Doctor arriving from the dashboard "Accept & Join Call" auto-joins.
  useEffect(() => {
    if (phase === 'ready' && role === 'doctor' && autoConnect) {
      const t = setTimeout(() => setPhase('call'), 500);
      return () => clearTimeout(t);
    }
  }, [phase, role, autoConnect]);

  // Prefill the live prescription form when a prescription already exists.
  useEffect(() => {
    const existing = appointment?.prescription;
    if (existing) {
      setDiagnosis(existing.diagnosis || '');
      setMedicines(existing.medicines || '');
      setTests(existing.tests || '');
      setAdvice(existing.advice || '');
    }
  }, [appointment]);

  // Enter the Zego call room (called from the waiting room CTA).
  const startCall = useCallback(() => {
    if (exitingRef.current) return;
    setRemoteLeft(false);
    setZegoError(null);
    setPhase('call');
  }, []);

  // Patient-initiated call. ONLY the patient clicks this, and ONLY while the
  // consultation slot window is open. The server re-validates the window and
  // decides between a real-time Incoming Call (doctor online) vs a stored
  // DoctorNotification + SMS alert (doctor offline).
  const initiatePatientCall = useCallback(async () => {
    if (!doctor || isCallingDoctor) return;
    if (role !== 'patient') return;

    // Legacy direct-doctor room without an appointment record — there is no
    // appointment to notify against, so enter the video room directly.
    if (!appointment?.id) {
      startCall();
      return;
    }

    setIsCallingDoctor(true);
    setDialError(null);
    setDialNotice(null);
    try {
      const pName = patientName;
      const res = await fetch('/api/consultation/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          patientName: pName,
          patientId: patient?.id || appointment.patientId || null,
          initiatedBy: 'patient',
          payload: {
            timeSlot: appointment.timeSlot,
            symptoms: appointment.symptoms,
          },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.code === 'CALL_NOT_OPEN' || data?.code === 'CALL_WINDOW_ENDED') {
          setDialError(data.error || 'This call is not available yet.');
          setNowTs(Date.now()); // re-evaluate the window immediately
          return;
        }
        throw new Error(data?.error || 'Could not reach your doctor. Please try again.');
      }

      if (data.doctorOnline === false) {
        // Doctor is offline → no incoming-call modal fires. Notification saved
        // and an SMS alert logged server-side; stay in the waiting room.
        setDialNotice(data.message || 'The doctor is currently offline.');
        return;
      }

      // Doctor online + event delivered → enter the encrypted video room and wait.
      startCall();
    } catch (err: any) {
      console.error('Error initiating call:', err);
      setDialError(err?.message || 'Could not reach your doctor. Please try again.');
    } finally {
      setIsCallingDoctor(false);
    }
  }, [appointment, doctor, patient, patientName, role, isCallingDoctor, startCall]);

  // Re-arm everything so the user can retry joining after an error.
  const resetAndRejoin = useCallback(() => {
    exitingRef.current = false;
    initStartedRef.current = false;
    joinedRef.current = false;
    try {
      zpRef.current?.destroy?.();
    } catch {
      // ignore teardown errors
    }
    zpRef.current = null;
    setZegoError(null);
    setPhase('ready');
  }, []);

  // Destroy the Zego instance, show a brief leaving screen, then route away.
  // After the doctor completes a consultation the patient lands on the
  // prescription page (if available), otherwise back home/dashboard.
  const exitConsultation = useCallback(async () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    try {
      zpRef.current?.destroy?.();
    } catch {
      // ignore teardown errors
    }
    zpRef.current = null;
    joinedRef.current = false;
    initStartedRef.current = false;
    setJoined(false);
    setPhase('ended');

    let destination: string;
    if (role === 'doctor') {
      destination = '/doctor/dashboard';
    } else if (appointment?.id) {
      destination = '/';
      try {
        const res = await fetch(`/api/prescriptions?appointmentId=${appointment.id}`);
        const data = await res.json();
        if (data?.success && data.prescription) {
          destination = `/prescription/${appointment.id}`;
        }
      } catch {
        // keep home
      }
    } else {
      destination = '/';
    }

    setTimeout(() => {
      try {
        router.replace(destination);
      } catch {
        // ignore navigation errors
      }
    }, 1200);
  }, [role, appointment, router]);

  // If the patient is left alone in the room (doctor ended the call),
  // auto-exit after a short grace period.
  useEffect(() => {
    if (!remoteLeft || role !== 'patient' || phase !== 'call') return;
    const t = setTimeout(() => {
      exitConsultation();
    }, 2500);
    return () => clearTimeout(t);
  }, [remoteLeft, role, phase, exitConsultation]);

  // Save the live prescription and mark the appointment as COMPLETED.
  const handleCompleteConsultation = async () => {
    setRxError(null);
    if (!appointment?.id || !doctor?.id) {
      setRxError('Consultation context is missing. Please reload the room.');
      return;
    }
    if (!diagnosis.trim() || !medicines.trim()) {
      setRxError('Please enter at least a diagnosis and the prescribed medicines.');
      return;
    }
    setIsSavingRx(true);
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: appointment.id,
          doctorId: doctor.id,
          patientId: patient?.id || appointment.patientId,
          doctorName,
          patientName,
          diagnosis,
          medicines,
          tests,
          advice,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save prescription');
      }
      setRxSaved(true);
      setIsSavingRx(false);
      // Small success pause, then end the Zego room & redirect to the dashboard.
      setTimeout(() => {
        exitConsultation();
      }, 1600);
    } catch (err: any) {
      setRxError(err?.message || 'Failed to save prescription');
      setIsSavingRx(false);
    }
  };

  // Boot the ZegoCloud UI Kit inside the video container. The SDK is a
  // browser-only UMD bundle, so it is dynamically imported after mount and
  // never executed during server-side rendering.
  useEffect(() => {
    if (phase !== 'call') return;
    if (!containerRef.current || !ZEGO_IS_CONFIGURED) return;
    if (zpRef.current || joinedRef.current || initStartedRef.current) return;

    initStartedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const mod: any = await import('@zegocloud/zego-uikit-prebuilt');
        const ZegoUIKitPrebuilt: any =
          mod?.ZegoUIKitPrebuilt ??
          mod?.default?.ZegoUIKitPrebuilt ??
          mod?.default ??
          mod;
        if (cancelled || !containerRef.current) return;
        if (!ZegoUIKitPrebuilt?.create) {
          throw new Error('ZegoUIKitPrebuilt could not be loaded.');
        }

        // All participants share the same room id: appointment id when booked,
        // doctor id for legacy/direct rooms.
        const roomKey = appointment?.id || doctor?.id || appointmentId;
        const roomID = `citydoctor_consult_${roomKey || 'room'}`;

        const identitySeed =
          (role === 'doctor'
            ? doctor?.id || appointment?.doctorId
            : patient?.id || appointment?.patientId) || appointmentId || 'guest';
        const userID = `${role === 'doctor' ? 'doc' : 'pat'}_${identitySeed}`.slice(0, 64);
        const userName = role === 'doctor' ? doctorName : patientName;

              // Generate a kit token with the ZegoCloud AppID + Server Secret.
        // (Newer SDK builds expose generateKitTokenForTest with the same
        // dev-token behaviour - kept as a compatibility fallback.)
        const kitToken =
          typeof ZegoUIKitPrebuilt.generateKitTokenWithZegoCloud === 'function'
            ? ZegoUIKitPrebuilt.generateKitTokenWithZegoCloud(
                ZEGO_APP_ID,
                ZEGO_SERVER_SECRET,
                roomID,
                userID,
                userName
              )
            : ZegoUIKitPrebuilt.generateKitTokenForTest(
                ZEGO_APP_ID,
                ZEGO_SERVER_SECRET,
                roomID,
                userID,
                userName
              );
        if (!kitToken) {
          throw new Error(
            'Could not generate a Zego kit token. Check your AppID and Server Secret.'
          );
        }

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;
        // Keep the room open when the other participant leaves so the doctor
        // can finish writing the prescription.
        zp.autoLeaveRoomWhenOnlySelfInRoom = false;

        const otherUserPrefix = role === 'doctor' ? 'pat' : 'doc';

        zp.joinRoom({
          container: containerRef.current,
          maxUsers: 2,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          showPreJoinView: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          useFrontFacingCamera: true,
          // Explicit UI feature flags - camera/mic toggles, screen share and
          // the end-call button are all provided by the prebuilt UI kit.
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: true,
          showTextChat: false,
          showUserList: false,
          showRoomDetailsButton: false,
          showRoomTimer: true,
          showLeavingView: true,
          showLeaveRoomConfirmDialog: false,
          layout: 'Auto',
          autoHideFooter: false,
          lowerLeftNotification: { showUserJoinAndLeave: true, showTextChat: false },
          onJoinRoom: () => {
            joinedRef.current = true;
            setJoined(true);
          },
          onLeaveRoom: () => {
            // Fired when the local user ends the call from the prebuilt UI.
            if (!exitingRef.current) {
              setTimeout(() => exitConsultation(), 50);
            }
          },
          onUserLeave: (users: any[]) => {
            const otherLeft = (users || []).some((u: any) =>
              String(u?.userID || '').startsWith(otherUserPrefix)
            );
            if (otherLeft) setRemoteLeft(true);
          },
        });
      } catch (err: any) {
        console.error('ZegoCloud join error:', err);
        if (cancelled) return;
        initStartedRef.current = false;
        setZegoError(
          err?.message || 'Failed to start the video call. Please try again.'
        );
        setPhase('ready');
      }
    })();

    return () => {
      cancelled = true;
      // If the dynamic import was still in-flight (e.g. React StrictMode
      // remount in dev) allow the next effect run to start over.
      if (!zpRef.current) initStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Teardown the Zego instance when the page unmounts.
  useEffect(() => {
    return () => {
      try {
        zpRef.current?.destroy?.();
      } catch {
        // ignore teardown errors
      }
      zpRef.current = null;
    };
  }, []);

  /* ---------------- Loading state ---------------- */
  if (phase === 'loading') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-3" />
        <h3 className="font-bold text-base text-slate-100">Entering Private Tele-Room...</h3>
        <p className="text-xs text-slate-500 mt-1">
          Establishing encrypted video channel &amp; loading your appointment
        </p>
      </div>
    );
  }

  /* ---------------- Not found state ---------------- */
  if (notFound) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-4 text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mb-3" />
        <h3 className="font-bold text-lg text-slate-100">Consultation Session Not Found</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          The requested tele-session or physician record could not be located.
        </p>
        <Link
          href="/"
          className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Doctors</span>
        </Link>
      </div>
    );
  }

  /* ---------------- Call ended (transient, then redirect) ---------------- */
  if (phase === 'ended') {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/10">
          <PhoneOff className="w-9 h-9" />
        </div>
        <h3 className="font-black text-lg text-slate-100">Call Ended</h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
          Redirecting you safely back...
        </p>
      </div>
    );
  }

  /* ---------------- ZegoCloud not configured ---------------- */
  if (!ZEGO_IS_CONFIGURED) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-slate-900/80 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">ZegoCloud video call is not configured</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Add your ZegoCloud <span className="font-mono text-amber-300">AppID</span> and{' '}
              <span className="font-mono text-amber-300">Server Secret</span> to your environment
              variables, then restart the dev server.
            </p>
          </div>
          <ol className="text-left text-[11px] text-slate-400 space-y-2 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 font-mono">
            <li>1. Create a project at console.zegocloud.com</li>
            <li>2. .env → NEXT_PUBLIC_ZEGO_APP_ID=1234567890</li>
            <li>3. .env → NEXT_PUBLIC_ZEGO_SERVER_SECRET=xxxx</li>
          </ol>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 font-semibold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- Pre-call ready / waiting room ---------------- */
  if (phase === 'ready') {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
        {/* Header */}
        <div className="h-14 px-4 lg:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href={role === 'doctor' ? '/doctor/dashboard' : '/'}
              className="flex items-center gap-1.5 text-slate-400 hover:text-teal-300 font-medium text-xs shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {role === 'doctor' ? 'Dashboard' : 'Home'}
            </Link>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-slate-200 text-xs truncate">{doctorName}</span>
          </div>
          {appointment?.paymentStatus === 'PAID' && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Fee Paid
            </div>
          )}
        </div>

        {/* Body */}
        <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
          <div className="w-full max-w-lg bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl p-8 text-center space-y-5">
            {/* Doctor avatar with pulse */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-teal-400/40 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center overflow-hidden shadow-xl shadow-teal-500/20 border-2 border-teal-400/50">
                {doctor?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={doctor.image} alt={doctorName} className="w-full h-full object-cover" />
                ) : (
                  <Stethoscope className="w-10 h-10 text-white" />
                )}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                {role === 'doctor' ? 'Doctor Consultation Room' : 'Consultation Waiting Room'}
              </div>
              <h2 className="text-xl font-extrabold text-slate-100">
                {role === 'doctor' ? `Ready for ${patientName}?` : `Waiting for ${doctorName}`}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {role === 'doctor'
                  ? 'Join the room to start the live video consultation. Your prescription panel opens beside the video feed.'
                  : windowStatus === 'not_started'
                    ? 'The consultation call opens automatically at your booked slot time.'
                    : windowStatus === 'ended'
                      ? 'This consultation slot has ended.'
                      : 'Press "Call Doctor" when you are ready — your doctor will receive an incoming-call alert.'}
              </p>
            </div>

            {/* Appointment summary */}
            {appointment && (
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient</span>
                  <span className="font-bold text-slate-200">{patientName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time Slot</span>
                  <span className="font-bold text-slate-200">{appointment.timeSlot || '—'}</span>
                </div>
                {appointment.symptoms && (
                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-slate-500 mb-1">Symptoms</div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {appointment.symptoms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action — patients initiate within the slot window; doctors enter directly */}
            {role === 'doctor' ? (
              <button
                onClick={startCall}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98]"
              >
                <PhoneCall className="w-5 h-5" />
                Enter Video Room
              </button>
            ) : windowStatus === 'not_started' ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled
                  className="w-full py-4 rounded-2xl bg-slate-800/80 text-slate-500 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
                  title={
                    callWindow?.scheduledAt
                      ? `Call opens at ${formatConsultationTime(callWindow.scheduledAt)}`
                      : 'Call opens at your scheduled time'
                  }
                >
                  <Clock className="w-5 h-5" />
                  {callWindow?.scheduledAt
                    ? `Call opens at ${formatConsultationTime(callWindow.scheduledAt)}`
                    : 'Call opens at your scheduled time'}
                </button>
                {callWindow &&
                  minutesUntilConsultationOpens(callWindow, new Date(nowTs)) > 0 && (
                    <p className="text-[11px] text-slate-500">
                      Opens in ~{minutesUntilConsultationOpens(callWindow, new Date(nowTs))} min —
                      you can call from 5 minutes before your booked slot.
                    </p>
                  )}
              </div>
            ) : windowStatus === 'ended' ? (
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-2xl bg-slate-800/80 text-slate-500 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Clock className="w-5 h-5" />
                Consultation slot has ended
              </button>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={initiatePatientCall}
                  disabled={isCallingDoctor}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCallingDoctor ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calling your doctor…
                    </>
                  ) : (
                    <>
                      <PhoneCall className="w-5 h-5" />
                      Call Doctor
                    </>
                  )}
                </button>
                {dialNotice && (
                  <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-500/25 rounded-xl p-2.5 flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-[1px]" />
                    <span>{dialNotice}</span>
                  </p>
                )}
                {dialError && (
                  <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 rounded-xl p-2.5 flex items-start gap-2 text-left">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-[1px]" />
                    <span>{dialError}</span>
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>End-to-end encrypted video consultation via ZegoCloud</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ---------------- In-call: ZegoCloud video + side panel ---------------- */
  const isPaid = appointment?.paymentStatus === 'PAID';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="h-14 px-4 lg:px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link
            href={role === 'doctor' ? '/doctor/dashboard' : '/'}
            className="flex items-center gap-1.5 text-slate-400 hover:text-teal-300 font-medium text-xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {role === 'doctor' ? 'Dashboard' : 'Home'}
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-slate-200 text-xs truncate">{doctorName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isPaid && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Paid
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
              joined
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                joined ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
              }`}
            />
            {joined ? 'Live Video' : 'Connecting'}
          </div>
        </div>
      </div>

      {/* Dual-panel body: 70% video | 30% live prescription / summary */}
      <main className="flex-1 min-h-0 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
        {/* LEFT — ZegoCloud UI Kit container (70%) */}
        <section className="relative w-full h-[52vh] lg:h-full lg:w-[70%] min-w-0 bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden shrink-0">
          <div ref={containerRef} className="absolute inset-0" />

          {!joined && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 pointer-events-none">
              <Loader2 className="w-9 h-9 animate-spin text-teal-400" />
              <p className="text-xs text-slate-400 font-semibold">
                Starting encrypted video room...
              </p>
            </div>
          )}

          {zegoError && (
            <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-slate-950/95">
              <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="w-9 h-9 text-rose-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-100">Video call failed</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed break-words">{zegoError}</p>
                <button
                  onClick={resetAndRejoin}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {remoteLeft && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 max-w-[92%] px-4 py-2 rounded-full bg-slate-900/95 border border-slate-700 text-[11px] font-semibold text-slate-300 shadow-xl text-center">
              {role === 'doctor'
                ? 'Patient has left the call — you can still finalize the prescription.'
                : 'Your doctor has ended the call — leaving this room shortly.'}
            </div>
          )}
        </section>

        <aside className="w-full lg:w-[30%] min-w-0 flex flex-col bg-slate-900/70 border-t lg:border-t-0 lg:border-l border-slate-800 h-[48vh] lg:h-full shrink-0">
          {/* Panel header */}
          <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-slate-950 flex items-center justify-center shrink-0">
                <Activity className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-100 text-xs leading-tight">
                  {role === 'doctor' ? 'Live Prescription' : 'Consultation Summary'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {role === 'doctor' ? `for ${patientName}` : `${patientName} • ${doctorName}`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[10px] font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              {joined ? 'In Call' : 'In Room'}
            </div>
          </div>

          {/* ==================== DOCTOR: live prescription ==================== */}
          {role === 'doctor' ? (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {rxSaved ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border-2 border-emerald-500/50 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">Prescription Saved!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Consultation marked as completed. The patient can download it from their
                      appointment page.
                    </p>
                  </div>
                  <p className="text-[11px] text-teal-300 animate-pulse font-semibold">
                    Leaving consultation room...
                  </p>
                </div>
              ) : !appointment ? (
                /* Legacy/direct doctor room has no appointment to attach a prescription to */
                <div className="p-5 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Doctor</span>
                      <span className="font-bold text-slate-200">{doctorName}</span>
                    </div>
                    {doctor?.specialty && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Specialty</span>
                        <span className="font-bold text-slate-200">{doctor.specialty}</span>
                      </div>
                    )}
                    {doctor?.hospital && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Hospital</span>
                        <span className="font-bold text-slate-200 truncate ml-3">
                          {doctor.hospital}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/80 leading-relaxed">
                    This is a direct video room without a booked appointment, so a live
                    prescription cannot be attached here.
                  </div>
                  <button
                    onClick={() => exitConsultation()}
                    className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call &amp; Exit
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Patient snapshot */}
                  <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3.5 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Patient</span>
                      <span className="font-bold text-slate-200 truncate ml-2">{patientName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Time Slot</span>
                      <span className="font-bold text-slate-200">{appointment.timeSlot || '—'}</span>
                    </div>
                    {appointment.symptoms && (
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <div className="text-slate-500 mb-1">Symptoms</div>
                        <p className="text-slate-300 leading-relaxed">{appointment.symptoms}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-500/5 border border-teal-500/20 text-[11px] text-slate-400 leading-relaxed">
                    Fill the prescription while you talk to the patient. Press{' '}
                    <span className="font-bold text-teal-300">Complete Consultation</span> to save
                    it, end the call and mark the appointment as done.
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Diagnosis <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Hypertension, Stage 1"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Medicines */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      Medicines <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder={'One per line, e.g.\nTab. Losartan 50mg — 1+0+1 — 30 days'}
                      value={medicines}
                      onChange={(e) => setMedicines(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none font-mono"
                    />
                  </div>

                  {/* Tests */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Suggested Tests</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. ECG, Lipid Profile, Serum Creatinine"
                      value={tests}
                      onChange={(e) => setTests(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  {/* Advice */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Advice / Follow-up</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Low salt diet, 30 min walk daily, review in 2 weeks"
                      value={advice}
                      onChange={(e) => setAdvice(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs placeholder-slate-600 focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  {rxError && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 mt-[1px] shrink-0" />
                      <span>{rxError}</span>
                    </div>
                  )}

                  {/* Complete Consultation */}
                  <button
                    onClick={handleCompleteConsultation}
                    disabled={isSavingRx}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSavingRx ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Prescription...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Complete Consultation
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => exitConsultation()}
                    className="w-full py-3 rounded-xl bg-slate-800/70 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call &amp; Exit
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ==================== PATIENT: consultation summary ==================== */
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                  {appointment ? (
                    <>
                      <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Doctor</span>
                          <span className="font-bold text-slate-200 text-right ml-3">
                            {doctorName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Time Slot</span>
                          <span className="font-bold text-slate-200">
                            {appointment.timeSlot || '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Payment</span>
                          {appointment.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                            </span>
                          ) : (
                            <span className="font-bold text-amber-400">
                              {appointment.paymentStatus || 'UNPAID'}
                            </span>
                          )}
                        </div>
                      </div>

                      {appointment.symptoms && (
                        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 text-xs space-y-1.5">
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                            Symptoms Shared
                          </div>
                          <p className="text-slate-300 leading-relaxed">{appointment.symptoms}</p>
                        </div>
                      )}

                      <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 text-xs text-slate-400 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-teal-300">
                          <Activity className="w-4 h-4" />
                          Your digital prescription
                        </div>
                        <p>
                          The doctor will save your prescription during this call. Once the call
                          ends, you can download it from your appointment page.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Doctor</span>
                        <span className="font-bold text-slate-200">{doctorName}</span>
                      </div>
                      {doctor?.specialty && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Specialty</span>
                          <span className="font-bold text-slate-200">{doctor.specialty}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => exitConsultation()}
                    className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <PhoneOff className="w-4 h-4" />
                    End Call &amp; Exit
                  </button>
                </div>
          )}
        </aside>
      </main>
    </div>
  );

}

export default function ConsultationRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
          <Loader2 className="w-10 h-10 animate-spin text-teal-400 mb-3" />
          <p className="text-sm font-semibold text-slate-500">Loading consultation room...</p>
        </div>
      }
    >
      <ConsultationRoomContent />
    </Suspense>
  );
}
