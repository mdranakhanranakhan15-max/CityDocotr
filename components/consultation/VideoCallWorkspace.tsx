'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Stethoscope,
  Send,
  Activity,
} from 'lucide-react';

interface VideoCallWorkspaceProps {
  appointment: any | null;
  doctor: any | null;
  patient: any | null;
  role: 'patient' | 'doctor';
  onEndCall: () => void;
}

export const VideoCallWorkspace: React.FC<VideoCallWorkspaceProps> = ({
  appointment,
  doctor,
  patient,
  role,
  onEndCall,
}) => {
  const router = useRouter();

  // Call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Prescription form state
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState('');
  const [tests, setTests] = useState('');
  const [advice, setAdvice] = useState('');
  const [isSavingRx, setIsSavingRx] = useState(false);
  const [rxSaved, setRxSaved] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  // Simulated WebRTC: "connect" the video room shortly after mount
  useEffect(() => {
    const t = setTimeout(() => setIsConnected(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Call timer
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (sec: number) =>
    `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  const patientName = patient?.name || appointment?.patientName || 'Patient';
  const doctorName = doctor?.name || appointment?.doctor?.name || 'Doctor';

  const handleSubmitAndEndCall = async () => {
    setRxError(null);
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
          appointmentId: appointment?.id,
          doctorId: doctor?.id,
          patientId: patient?.id || appointment?.patientId,
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
      // Short success state, then leave the room
      setTimeout(() => {
        onEndCall();
        if (role === 'doctor') {
          router.push('/doctor/dashboard');
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (err: any) {
      setRxError(err.message || 'Failed to save prescription');
      setIsSavingRx(false);
    }
  };

  // End call without saving
  const handleEndCall = () => {
    onEndCall();
    if (role === 'doctor') router.push('/doctor/dashboard');
    else router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden gap-3 sm:gap-4">
      {/* ============ VIDEO AREA ============ */}
      <section className="flex-1 flex flex-col min-w-0 h-full">
        {/* Video grid */}
        <div className="relative flex-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden min-h-[340px]">
          {/* Large central video feed — PATIENT */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
            {/* Simulated WebRTC video feed for the patient */}
            <div className="absolute inset-0">
              <div
                className={`absolute inset-0 transition-opacity duration-500 ${
                  isCameraOff && role === 'doctor' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={patient?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'}
                  alt={patientName}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
                <div className="w-9 h-9 rounded-full bg-slate-900/80 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white drop-shadow">
                    {patientName}
                    <span className="ml-2 text-[10px] text-teal-300 font-semibold uppercase tracking-wider">
                      {role === 'doctor' ? 'Patient' : 'You'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1.5">
                    {isConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        Connecting...
                      </>
                    )}
                    <span>• {formatDuration(callSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Picture-in-Picture — DOCTOR */}
          <div className="absolute top-4 right-4 w-36 sm:w-44 rounded-xl overflow-hidden border-2 border-teal-500/50 shadow-2xl z-20 bg-slate-900">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-teal-950 to-slate-950 flex items-center justify-center">
              {isCameraOff && role === 'patient' ? (
                <div className="w-14 h-14 rounded-full bg-slate-800 text-teal-300 flex items-center justify-center">
                  <VideoOff className="w-6 h-6" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doctor?.image || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Participant label */}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/70 text-[9px] font-bold text-teal-300 flex items-center gap-1">
                <Stethoscope className="w-2.5 h-2.5" />
                {role === 'doctor' ? 'You' : 'Doctor'}
              </div>
              {isMuted && role === 'patient' && (
                <div className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-red-500/80">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Center connecting overlay */}
          {!isConnected && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <div className="text-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
                <p className="text-xs text-slate-300 font-semibold">
                  Establishing secure WebRTC channel...
                </p>
              </div>
            </div>
          )}
        </div>


        {/* Call controls bar */}
        <div className="shrink-0 mt-3 flex items-center justify-center gap-2.5 sm:gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <button
            onClick={() => setIsMuted((v) => !v)}
            disabled={!isConnected}
            className={`p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsCameraOff((v) => !v)}
            disabled={!isConnected}
            className={`p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isCameraOff
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
            }`}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 transition-all"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>

          <div className="ml-2 text-xs font-mono text-slate-400 hidden sm:block">
            {formatDuration(callSeconds)}
          </div>
        </div>
      </section>


      {/* ============ RIGHT SIDEBAR ============ */}
      <section className="w-full xl:w-[380px] shrink-0 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2.5 bg-slate-950/50">
          <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Digital Prescription</h3>
            <p className="text-[10px] text-slate-500">
              {role === 'doctor' ? 'Write & save during the call' : 'Doctor writes during the call'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {rxSaved ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 border-2 border-emerald-500/50 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100">Prescription Saved!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  The patient can download it from their appointment page.
                </p>
              </div>
              <p className="text-[11px] text-teal-300 animate-pulse font-semibold">
                Leaving consultation room...
              </p>
            </div>
          ) : role === 'doctor' ? (
            <div className="space-y-3">
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

              {/* Submit & End Call */}
              <button
                onClick={handleSubmitAndEndCall}
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
                    Submit &amp; End Call
                  </>
                )}
              </button>
            </div>
          ) : (
            /* PATIENT ROLE: summary + prescription status */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Doctor</span>
                  <span className="font-bold text-slate-200">{doctorName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time Slot</span>
                  <span className="font-bold text-slate-200">
                    {appointment?.timeSlot || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-400">PAID &amp; CONFIRMED</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 font-bold text-teal-300">
                  <Activity className="w-4 h-4" />
                  Your digital prescription
                </div>
                <p>
                  The doctor will save your prescription during this call. Once the call ends, you
                  can download it from your appointment page.
                </p>
              </div>

              <button
                onClick={handleEndCall}
                className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                End Call &amp; Exit
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

