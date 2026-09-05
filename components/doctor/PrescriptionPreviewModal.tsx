'use client';

import React from 'react';
import Link from 'next/link';
import {
  X,
  FileText,
  Pill,
  FlaskConical,
  HeartPulse,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface PrescriptionPreviewModalProps {
  open: boolean;
  appt: any | null; // completed Appointment incl. prescription + patient
  onClose: () => void;
}

/**
 * Read-only digital prescription viewer used from the Doctor Portal's
 * "Patient History" tab. Only renders prescription data the API already
 * returned for the logged-in doctor's own completed appointments.
 */
export const PrescriptionPreviewModal: React.FC<PrescriptionPreviewModalProps> = ({
  open,
  appt,
  onClose,
}) => {
  if (!open || !appt) return null;

  const rx = appt.prescription || {};
  const patientName = appt.patient?.name || appt.patientName || 'Patient';
  const medList = (rx.medicines || '')
    .split('\n')
    .map((m: string) => m.trim())
    .filter(Boolean);
  const testList = (rx.tests || '')
    .split('\n')
    .map((t: string) => t.trim())
    .filter(Boolean);

  const consultedOn = new Date(rx.createdAt || appt.scheduledAt || Date.now());
  const dateLabel = consultedOn.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-100 text-base truncate">
                Digital Prescription
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {patientName} • {dateLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable prescription body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              {patientName}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {appt.timeSlot || dateLabel}
            </span>
            {appt.patient?.phone && (
              <span className="text-slate-500">{appt.patient.phone}</span>
            )}
          </div>

          {/* Diagnosis */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-rose-400" /> Diagnosis
            </div>
            <p className="text-sm font-semibold text-slate-100 leading-relaxed">
              {rx.diagnosis || 'Not recorded'}
            </p>
          </div>

          {/* Medicines */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
              <Pill className="w-3.5 h-3.5 text-teal-400" /> Medicines
            </div>
            {medList.length > 0 ? (
              <ol className="space-y-2">
                {medList.map((med: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-slate-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{med}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-slate-500">No medicines recorded.</p>
            )}
          </div>

          {/* Tests & advice */}
          <div className="grid sm:grid-cols-2 gap-4">
            {testList.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  <FlaskConical className="w-3.5 h-3.5 text-violet-400" /> Suggested Tests
                </div>
                <ul className="space-y-1">
                  {testList.map((t: string, i: number) => (
                    <li
                      key={i}
                      className="text-slate-300 flex items-start gap-1.5"
                    >
                      <span className="text-violet-400 font-black">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {rx.advice && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" /> Advice & Follow-up
                </div>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {rx.advice}
                </p>
              </div>
            )}
          </div>

          {/* Issued by */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-dashed border-slate-800 pt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Verified by CityDoctor Telehealth
            </span>
            <span className="font-bold text-slate-300">
              Dr. {rx.doctorName || 'Doctor'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-950/70">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Close
          </button>
          <Link
            href={`/prescription/${appt.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Printable Page
          </Link>
        </div>
      </div>
    </div>
  );
};

