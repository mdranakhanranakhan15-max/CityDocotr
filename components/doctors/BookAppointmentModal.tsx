'use client';

import React, { useState } from 'react';
import {
  X,
  CalendarCheck,
  Clock,
  Video,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Stethoscope,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

interface BookAppointmentModalProps {
  doctor: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [patientName, setPatientName] = useState('John Smith');
  const [patientEmail, setPatientEmail] = useState('john.smith@example.com');
  const [patientPhone, setPatientPhone] = useState('+1 (555) 234-5678');
  const [symptoms, setSymptoms] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<any | null>(null);

  if (!isOpen || !doctor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientEmail || !symptoms) {
      setError('Please fill in your name, email, and symptoms.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName,
          patientEmail,
          patientPhone,
          symptoms,
          scheduledAt: scheduledAt || new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      setBookedAppointment(data.appointment);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setBookedAppointment(null);
    setSymptoms('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={handleResetAndClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                Book Consultation Session
              </h3>
              <p className="text-xs text-slate-400">
                Confirm your teleconsultation appointment with {doctor.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SUCCESS CONFIRMATION STATE */}
        {bookedAppointment ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-100">
                Consultation Confirmed!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                Your video consultation with <span className="text-teal-300 font-semibold">{doctor.name}</span> has been confirmed and registered in our system.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Doctor:</span>
                <span className="font-semibold text-slate-200">{doctor.name} ({doctor.specialty})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Consultation Fee:</span>
                <span className="font-bold text-teal-300">${doctor.consultationFee} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="font-bold text-emerald-400">CONFIRMED (Ready)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={handleResetAndClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>

              <Link
                href={`/consultation/${doctor.id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20"
              >
                <Video className="w-4 h-4" />
                <span>Enter Video Room Now</span>
              </Link>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
            {/* Doctor Card Snippet */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <img
                src={doctor.image}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-100 text-sm truncate">{doctor.name}</div>
                <div className="text-[11px] text-teal-400 font-medium">{doctor.specialty}</div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{doctor.hospital}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-teal-300">${doctor.consultationFee}</div>
                <div className="text-[10px] text-slate-500">per consult</div>
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Patient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Patient Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Preferred Schedule</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Symptoms Description */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">
                Primary Symptoms / Consultation Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe what you are experiencing (e.g. fever, headache duration, allergy symptoms)..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Book Appointment</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

