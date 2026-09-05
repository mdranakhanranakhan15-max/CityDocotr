'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Doctor } from '@/types/doctor';
import { CallStatus, CallControlsState } from '@/types/consultation';
import { ParticipantBadge } from './ParticipantBadge';
import { VideoControls } from './VideoControls';
import {
  Video as VideoIcon,
  MicOff,
  User,
  Activity,
  FileText,
  Sparkles,
  Volume2,
  AlertCircle,
  Radio,
  CheckCircle2,
} from 'lucide-react';

interface VideoRoomProps {
  doctor: Doctor;
  callStatus: CallStatus;
  onStartCall: () => void;
  onEndCall: () => void;
}

export const VideoRoom: React.FC<VideoRoomProps> = ({
  doctor,
  callStatus,
  onStartCall,
  onEndCall,
}) => {
  const [controlsState, setControlsState] = useState<CallControlsState>({
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
    isRecording: false,
    speakerVolume: 100,
  });

  const [callSeconds, setCallSeconds] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [doctorSpeaking, setDoctorSpeaking] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Call timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Doctor simulated speech animation during call
  useEffect(() => {
    if (callStatus !== 'connected') {
      setDoctorSpeaking(false);
      return;
    }
    const interval = setInterval(() => {
      setDoctorSpeaking((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, [callStatus]);

  // Handle local user media (Webcam) when call is active & camera is on
  useEffect(() => {
    let stream: MediaStream | null = null;

    async function initUserMedia() {
      if (callStatus === 'connected' && !controlsState.isCameraOff) {
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 640, height: 480 },
              audio: false, // audio handled via controls
            });
            setLocalStream(stream);
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            setCameraError(null);
          }
        } catch (err: any) {
          console.log('Webcam permission not granted or device unavailable, using simulated PiP:', err);
          setCameraError('Webcam preview mode');
        }
      } else {
        if (localStream) {
          localStream.getTracks().forEach((t) => t.stop());
          setLocalStream(null);
        }
      }
    }

    initUserMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [callStatus, controlsState.isCameraOff]);

  // Format call duration MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = () => {
    setControlsState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleToggleCamera = () => {
    setControlsState((prev) => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  };

  const handleToggleScreenShare = () => {
    setControlsState((prev) => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  };

  const handleToggleSpeaker = () => {
    setControlsState((prev) => ({
      ...prev,
      speakerVolume: prev.speakerVolume === 0 ? 100 : 0,
    }));
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] xl:h-[480px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center select-none"
    >
      {/* Background Gradient & Room Grid */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950/90 to-slate-950 pointer-events-none" />

      {/* STATE 1: CONNECTED (Active Video Call) */}
      {callStatus === 'connected' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Simulated Doctor Video Stream Frame */}
          <div className="relative w-full h-full">
            <Image
              src={doctor.avatar}
              alt={doctor.name}
              fill
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              className="object-cover object-top filter brightness-[0.88] contrast-[1.05]"
            />

            {/* Video overlay vignette & clinical lighting effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />

            {/* Doctor Live Audio Indicator */}
            {doctorSpeaking && (
              <div className="absolute bottom-20 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-950/80 backdrop-blur-md border border-teal-500/40 text-teal-300 text-xs shadow-lg animate-pulse">
                <Volume2 className="w-4 h-4 text-teal-400" />
                <span>Dr. {doctor.name.split(' ').pop()} speaking...</span>
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-1 h-3 bg-teal-400 rounded-full animate-wave" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-4 bg-teal-400 rounded-full animate-wave" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-2 bg-teal-400 rounded-full animate-wave" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Screen Sharing Overlay */}
            {controlsState.isScreenSharing && (
              <div className="absolute top-16 right-4 z-20 w-64 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-teal-500/50 shadow-2xl text-xs space-y-1.5 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-1.5 text-teal-300 font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>Sharing EHR Medical Record</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Active Vitals & Recent Lab Tests are currently presented on the doctor&apos;s secondary monitor.
                </p>
              </div>
            )}
          </div>

          {/* Participant Badges (Top Left) */}
          <ParticipantBadge
            doctor={doctor}
            isCallActive={true}
            callDuration={formatDuration(callSeconds)}
          />

          {/* Patient Picture-in-Picture (Bottom-Right Self View) */}
          <div className="absolute bottom-20 sm:bottom-20 right-4 z-20 w-28 h-20 sm:w-36 sm:h-28 rounded-xl overflow-hidden border-2 border-teal-500/70 shadow-2xl bg-slate-900 group">
            {controlsState.isCameraOff ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 p-2">
                <User className="w-6 h-6 text-slate-600 mb-1" />
                <span className="text-[10px] font-medium text-slate-400">Camera Off</span>
              </div>
            ) : localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="w-full h-full relative bg-slate-800 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  YOU
                </div>
                <span className="text-[10px] text-slate-300 mt-1 font-medium">Self View</span>
              </div>
            )}

            {/* Local Mute Indicator */}
            {controlsState.isMuted && (
              <div className="absolute top-1.5 right-1.5 p-1 rounded-md bg-red-600/90 text-white shadow">
                <MicOff className="w-3 h-3" />
              </div>
            )}

            <div className="absolute bottom-1 left-2 text-[10px] text-white font-medium drop-shadow-md">
              You (Patient)
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: CALLING / CONNECTING */}
      {callStatus === 'calling' && (
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 z-20">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-400 shadow-xl relative">
              <Image
                src={doctor.avatar}
                alt={doctor.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>
            <span className="absolute -inset-2 rounded-2xl border-2 border-teal-400/50 animate-ping" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 text-teal-400 font-semibold text-sm">
              <Radio className="w-4 h-4 animate-spin" />
              <span>Establishing WebRTC Video Channel...</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Calling {doctor.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {doctor.hospital} • {doctor.specialty}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>Negotiating HD audio & video streams...</span>
          </div>

          <button
            onClick={onEndCall}
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-transform active:scale-95"
          >
            Cancel Call
          </button>
        </div>
      )}

      {/* STATE 3: IDLE (Consultation Lobby / Ready to connect) */}
      {callStatus === 'idle' && (
        <div className="w-full h-full flex flex-col justify-between p-6 z-20">
          {/* Header Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-slate-700 shadow-md">
                <Image
                  src={doctor.avatar}
                  alt={doctor.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-slate-100 text-base">{doctor.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                    {doctor.badge || 'Physician'}
                  </span>
                </div>
                <p className="text-xs text-teal-400 font-medium">
                  {doctor.title}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Physician is Online & Ready</span>
            </div>
          </div>

          {/* Center Consultation Card */}
          <div className="max-w-md mx-auto text-center space-y-3 py-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-lg shadow-teal-500/10">
              <VideoIcon className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-100">
                Ready for your Video Consultation?
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                You will connect directly to {doctor.name}&apos;s secure private tele-room.
              </p>
            </div>

            {/* Pre-consultation checklist */}
            <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Camera & Mic Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>HD Audio Stream</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Private & Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>AI Clinical Notes Active</span>
              </div>
            </div>
          </div>

          {/* Bottom Call CTA placeholder for alignment */}
          <div className="h-10" />
        </div>
      )}

      {/* Floating Controls Bar */}
      <VideoControls
        isCallActive={callStatus === 'connected'}
        controlsState={controlsState}
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleSpeaker={handleToggleSpeaker}
        onStartCall={onStartCall}
        onEndCall={onEndCall}
        onToggleFullscreen={handleToggleFullscreen}
      />
    </div>
  );
};

