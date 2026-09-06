'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Loader2,
  CalendarCheck,
  CalendarDays,
  Clock,
  Stethoscope,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
} from 'lucide-react';
import Link from 'next/link';

interface PatientRecord {
  id: string;
  name: string;
  phone: string | null;
  location?: string | null;
  email?: string | null;
}

interface AppointmentHistoryModalProps {
  patient: PatientRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const bdt = (n?: number | null) =>
  `৳${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const formatDate = (value?: string | Date) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (value?: string | Date) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

const BookingStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; cls: string }> = {
    CONFIRMED: {
      label: 'Confirmed',
      cls: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    },
    PENDING: { label: 'Pending', cls: 'text-amber-300 border-amber-500/40 bg-amber-500/10' },
    COMPLETED: { label: 'Completed', cls: 'text-blue-300 border-blue-500/40 bg-blue-500/10' },
    CANCELLED: { label: 'Cancelled', cls: 'text-rose-300 border-rose-500/40 bg-rose-500/10' },
  };
  const s = (map[status] || map.PENDING) as { label: string; cls: string };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}
    >
      {status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
      {s.label}
    </span>
  );
};

const PaymentBadge: React.FC<{ status: string }> = ({ status }) => {
  const cls =
    status === 'PAID'
      ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
      : status === 'REFUNDED'
        ? 'text-rose-300 border-rose-500/40 bg-rose-500/10'
        : 'text-amber-300 border-amber-500/40 bg-amber-500/10';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${cls}`}>
      {status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
      {status || 'UNPAID'}
    </span>
  );
};

export const AppointmentHistoryModal: React.FC<AppointmentHistoryModalProps> = ({
  patient,
  isOpen,
  onClose,
}) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!patient?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/appointments?patientId=${encodeURIComponent(patient.id)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load appointment history.');
      }
      setAppointments(data.appointments || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointment history.');
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [patient?.id]);

  useEffect(() => {
    if (isOpen && patient?.id) {
      setAppointments([]);
      loadAppointments();
    }
  }, [isOpen, patient?.id, loadAppointments]);

  if (!isOpen || !patient) return null;

  const patientName = patient.name || 'Patient';
  const initials = patientName.trim().charAt(0).toUpperCase() || 'P';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white font-black text-base flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-100 text-sm sm:text-base truncate">
                Appointment History — {patientName}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                {patient.phone && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-teal-400" /> {patient.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarCheck className="w-3 h-3 text-teal-400" />
                  {appointments.length} booking{appointments.length === 1 ? '' : 's'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
              <p className="text-xs font-semibold">Loading booking history...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">No bookings found</p>
              <p className="text-xs text-slate-500">
                This patient has not booked any consultations yet.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Scheduled Date &amp; Slot</th>
                      <th className="py-3 px-4">Fee Paid</th>
                      <th className="py-3 px-4">TrxID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {appointments.map((appt) => (
                      <tr key={appt.id} className="hover:bg-slate-800/40 transition-colors align-top">
                        {/* Doctor */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            {appt.doctor?.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={appt.doctor.image}
                                alt={appt.doctor?.name || 'Doctor'}
                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-700"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full bg-teal-500/15 text-teal-300 flex items-center justify-center shrink-0">
                                <Stethoscope className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="truncate">{appt.doctor?.name || 'Doctor'}</span>
                          </div>
                          <div className="text-[10px] text-teal-400 mt-1 pl-9">
                            {appt.doctor?.specialty || 'General Physician'}
                          </div>
                        </td>
                        {/* Date & Slot */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-[11px] text-slate-200">
                            {appt.timeSlot || `${formatDate(appt.scheduledAt)} • ${formatTime(appt.scheduledAt)}`}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Booked {formatDate(appt.createdAt || appt.scheduledAt)}
                          </div>
                        </td>

                        {/* Fee paid */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-emerald-300">
                            {bdt(appt.amountPaid ?? appt.doctor?.consultationFee)}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {appt.paymentMethod === 'CARD' ? 'Card' : appt.paymentMethod === 'BKASH' ? 'bKash' : '—'}
                          </div>
                        </td>

                        {/* TrxID */}
                        <td className="py-3.5 px-4">
                          {appt.transactionId ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-200">
                              <CreditCard className="w-3 h-3 text-teal-400" />
                              {appt.transactionId}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">—</span>
                          )}
                          {appt.paymentStatus && (
                            <div className="mt-1">
                              <PaymentBadge status={appt.paymentStatus} />
                            </div>
                          )}
                        </td>

                        {/* Booking status */}
                        <td className="py-3.5 px-4">
                          <BookingStatusBadge status={appt.status} />
                          {appt.symptoms && appt.status !== 'COMPLETED' && (
                            <div className="text-[10px] text-slate-500 mt-1.5 max-w-[160px] truncate">
                              {appt.symptoms}
                            </div>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          {appt.status === 'COMPLETED' ? (
                            <Link
                              href={`/prescription/${appt.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold transition-colors"
                            >
                              Prescription
                            </Link>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1.5 rounded-lg bg-slate-900/60 text-slate-600 border border-slate-800 text-[10px] font-bold cursor-not-allowed">
                              —
                            </span>
                          )}
                        </td>                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Search className="w-3.5 h-3.5 text-teal-400" />
            Scoped to this patient&apos;s bookings only
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
