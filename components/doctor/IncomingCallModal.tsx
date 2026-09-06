'use client';

import React from 'react';
import { Phone, PhoneCall, PhoneOff, Loader2, Stethoscope, Clock, Video } from 'lucide-react';

interface IncomingCallModalProps {
  isOpen: boolean;
  patientName: string;
  doctorName: string;
  doctorImage?: string | null;
  timeSlot?: string | null;
  symptoms?: string | null;
  isAccepting?: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  isOpen,
  patientName,
  doctorName,
  doctorImage,
  timeSlot,
  symptoms,
  isAccepting,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-sm" onClick={onDecline} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-slate-900 border border-teal-500/40 rounded-3xl shadow-2xl shadow-teal-500/10 z-10 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Pulsing ring animation */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-teal-500/20 to-transparent" />

        <div className="relative p-6 text-center">
          {/* Avatar with ripple rings */}
          <div className="relative w-28 h-28 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-teal-400/40 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-teal-400/30 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-xl shadow-teal-500/30 overflow-hidden">
              {doctorImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={doctorImage} alt={doctorName} className="w-full h-full object-cover" />
              ) : (
                <Stethoscope className="w-12 h-12 text-white" />
              )}
            </div>
          </div>

          {/* Incoming call label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider animate-pulse mb-3">
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            Incoming Call
          </div>

          <h3 className="text-xl font-extrabold text-slate-100">
            Patient {patientName} is waiting for you
          </h3>
          <p className="text-xs text-slate-400 mt-1">Doctor: {doctorName}</p>

          {/* Appointment context */}
          {(timeSlot || symptoms) && (
            <div className="mt-4 space-y-2 text-left">
              {timeSlot && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{timeSlot}</span>
                </div>
              )}
              {symptoms && (
                <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
                  <Video className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-[1px]" />
                  <span className="line-clamp-2">"{symptoms}"</span>
                </div>
              )}
            </div>
          )}

          {/* Accept / Decline actions */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onDecline}
              disabled={isAccepting}
              className="py-3 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs border border-rose-500/30 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <PhoneOff className="w-4 h-4" />
              Decline
            </button>
            <button
              onClick={onAccept}
              disabled={isAccepting}
              className="py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-60 active:scale-95"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  Accept &amp; Join Call
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
