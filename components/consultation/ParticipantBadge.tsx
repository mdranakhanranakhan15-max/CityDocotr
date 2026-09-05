'use client';

import React from 'react';
import { Wifi, ShieldCheck, User } from 'lucide-react';
import { Doctor } from '@/types/doctor';

interface ParticipantBadgeProps {
  doctor: Doctor;
  isCallActive: boolean;
  callDuration: string;
}

export const ParticipantBadge: React.FC<ParticipantBadgeProps> = ({
  doctor,
  isCallActive,
  callDuration,
}) => {
  return (
    <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
      {/* Doctor Identity Badge */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-slate-100">{doctor.name}</span>
        <span className="text-slate-400">({doctor.specialty})</span>
      </div>

      {/* Live Duration Timer */}
      {isCallActive && (
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-950/80 backdrop-blur-md border border-red-700/50 shadow-lg text-xs text-red-300 font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{callDuration}</span>
        </div>
      )}

      {/* Signal Quality */}
      <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-slate-800 text-xs text-slate-300">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[11px] font-mono">1080p HD (24ms)</span>
      </div>

      {/* E2E Security */}
      <div className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-950/70 backdrop-blur-md border border-teal-800/60 text-xs text-teal-300">
        <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        <span className="text-[11px]">E2E Encrypted</span>
      </div>
    </div>
  );
};

