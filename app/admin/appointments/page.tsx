'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Filter,
  Trash2,
  Loader2,
  RefreshCw,
  User,
  MapPin,
  Phone,
  Clock,
  Banknote,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Admin tracks EVERY booking & payment attempt — PAID, UNPAID, FAILED,
  // PENDING_PAYMENT and REFUNDED all appear (badged). Default filter is ALL.
  const [paymentStatus, setPaymentStatus] = useState('ALL');

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (paymentStatus !== 'ALL') params.set('paymentStatus', paymentStatus);
      const url = `/api/appointments?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  const handleUpdateStatus = async (id: string, nextStatus: string) => {
    try {
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and remove this appointment record?')) {
      return;
    }
    try {
      await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  // Prefer the live linked Patient record; fall back to denormalized columns.
  const patientName = (appt: any) =>
    appt.patient?.name || appt.patientName || 'Unknown Patient';
  const patientPhone = (appt: any) =>
    appt.patient?.phone || appt.patientPhone || '—';
  const patientLocation = (appt: any) =>
    appt.patient?.location || appt.patientLocation || '—';
  const bookedDoctor = (appt: any) =>
    appt.doctor?.name || 'Unknown Doctor';

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            All Bookings &amp; Payment Attempts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every booking synced from checkout — PAID, UNPAID, FAILED &amp; PENDING_PAYMENT attempts appear here with badges so admins can track payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-750 text-slate-200">
            <Filter className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="bg-transparent outline-none text-slate-200"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid Bookings</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PENDING_PAYMENT">Pending Payment</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          <button
            onClick={fetchAppointments}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-500/20 group hover:border-emerald-400/40 transition-colors">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Bookings
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 mt-2 font-mono">
                {appointments.filter((a) => a.paymentStatus === 'PAID').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 border border-teal-500/20 group hover:border-teal-400/40 transition-colors">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-teal-400" /> Total Collected
              </div>
              <div className="text-2xl font-extrabold text-teal-300 mt-2 font-mono">
                ৳
                {appointments
                  .filter((a) => a.paymentStatus === 'PAID')
                  .reduce((sum, a) => sum + (a.amountPaid || 0), 0)
                  .toLocaleString()}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5 text-teal-400" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/70 border border-sky-500/20 group hover:border-sky-400/40 transition-colors">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" /> bKash Payments
              </div>
              <div className="text-2xl font-extrabold text-sky-300 mt-2 font-mono">
                {appointments.filter((a) => a.paymentStatus === 'PAID' && a.paymentMethod === 'BKASH').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/70 border border-purple-500/20 group hover:border-purple-400/40 transition-colors">
          <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-purple-400" /> Card Payments
              </div>
              <div className="text-2xl font-extrabold text-purple-300 mt-2 font-mono">
                {appointments.filter((a) => a.paymentStatus === 'PAID' && a.paymentMethod === 'CARD').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </div>


      {/* Table */}
      <div className="p-5 rounded-[1.5rem] bg-slate-900/70 border border-slate-800/80 shadow-xl backdrop-blur-sm ring-1 ring-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Booked Doctor</th>
                <th className="py-3 px-3">Time Slot</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                    <span>Syncing paid bookings...</span>
                  </td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-800/60 transition-colors">
                    {/* Patient: real Name, Phone, Location */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-teal-400" />
                        <span>{patientName(appt)}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {patientPhone(appt)}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {patientLocation(appt)}
                      </div>
                    </td>

                    {/* Booked Doctor */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200">{bookedDoctor(appt)}</div>
                      <div className="text-[11px] text-teal-400">{appt.doctor?.specialty}</div>
                      <div className="text-[10px] text-slate-500">
                        ৳{appt.doctor?.consultationFee} fee
                      </div>
                    </td>

                    {/* Time Slot */}
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {appt.timeSlot ? (
                        <div className="text-slate-200">{appt.timeSlot}</div>
                      ) : (
                        <div className="text-slate-400">
                          {new Date(appt.scheduledAt).toLocaleDateString()}{' '}
                          {new Date(appt.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Booked {new Date(appt.createdAt || appt.scheduledAt).toLocaleDateString()}
                      </div>
                    </td>


                    {/* Payment */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          appt.paymentStatus === 'PAID'
                            ? 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
                            : appt.paymentStatus === 'UNPAID'
                            ? 'text-amber-300 border-amber-500/40 bg-amber-500/10'
                            : appt.paymentStatus === 'PENDING_PAYMENT'
                            ? 'text-sky-300 border-sky-500/40 bg-sky-500/10'
                            : appt.paymentStatus === 'FAILED'
                            ? 'text-rose-300 border-rose-500/40 bg-rose-500/10'
                            : appt.paymentStatus === 'REFUNDED'
                            ? 'text-purple-300 border-purple-500/40 bg-purple-500/10'
                            : 'text-slate-300 border-slate-500/40 bg-slate-500/10'
                        }`}
                      >
                        {appt.paymentStatus === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                        {appt.paymentStatus}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {appt.paymentMethod === 'CARD' ? 'Card' : 'bKash'} • ৳
                        {(appt.amountPaid || 0).toLocaleString()}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={appt.status}
                        onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-950 border focus:ring-1 focus:ring-teal-500 ${
                          appt.status === 'CONFIRMED'
                            ? 'text-emerald-300 border-emerald-500/40'
                            : appt.status === 'PENDING'
                            ? 'text-amber-300 border-amber-500/40'
                            : appt.status === 'COMPLETED'
                            ? 'text-teal-300 border-teal-500/40'
                            : 'text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDelete(appt.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                          title="Delete appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No appointments found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

