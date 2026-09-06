'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatsCard } from '@/components/admin/StatsCard';
import {
  Users,
  CalendarCheck,
  DollarSign,
  Activity,
  Plus,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { DoctorFormModal } from '@/components/admin/DoctorFormModal';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, apptsRes, docsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/appointments'),
        fetch('/api/doctors'),
      ]);

      const statsData = await statsRes.json();
      const apptsData = await apptsRes.json();
      const docsData = await docsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (apptsData.success) setRecentAppointments(apptsData.appointments.slice(0, 5));
      if (docsData.success) setDoctors(docsData.doctors.slice(0, 5));
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleDoctorStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Telehealth Operations Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time monitoring of active physicians, appointments, and video consults.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsDoctorModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-600/25 active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Physician</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active Doctors"
          value={stats ? `${stats.onlineDoctors} / ${stats.totalDoctors}` : '...'}
          subtitle="Currently Online & Ready"
          icon={Activity}
          trend="+2 online now"
          color="emerald"
        />
        <StatsCard
          title="Total Consultations"
          value={stats ? stats.totalAppointments : '...'}
          subtitle={`${stats?.pendingAppointments || 0} pending triage`}
          icon={CalendarCheck}
          trend="+18% this week"
          color="teal"
        />
        <StatsCard
          title="Registered Patients"
          value={stats ? stats.totalPatients : '...'}
          subtitle="Active telehealth users"
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Estimated Revenue"
          value={stats ? `$${stats.totalRevenue}` : '...'}
          subtitle="Consultation session fees"
          icon={DollarSign}
          trend="+24% vs last month"
          color="amber"
        />
      </div>

      {/* Grid: Recent Appointments & Online Physicians Quick Switch */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Consultations Table */}
        <div className="lg:col-span-2 p-5 rounded-[1.5rem] bg-slate-900/70 border border-slate-800/80 shadow-xl backdrop-blur-sm ring-1 ring-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-teal-400" />
              <h2 className="font-bold text-slate-100 text-base">Recent Consultations</h2>
            </div>
            <Link
              href="/admin/appointments"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentAppointments.length > 0 ? (
                  recentAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{appt.patientName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                          {appt.symptoms}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{appt.doctor?.name}</div>
                        <div className="text-[11px] text-teal-400">{appt.doctor?.specialty}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            appt.status === 'CONFIRMED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : appt.status === 'COMPLETED'
                                ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                                : appt.status === 'TIMED_OUT'
                                  ? 'bg-slate-600/20 text-slate-300 border-slate-500/40'
                                  : appt.status === 'CANCELLED'
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                    : appt.status === 'PENDING'
                                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                      : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(appt.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No consultation records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Doctor Availability Toggle Snapshot */}
        <div className="p-5 rounded-[1.5rem] bg-slate-900/70 border border-slate-800/80 shadow-xl backdrop-blur-sm ring-1 ring-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <h2 className="font-bold text-slate-100 text-base">Physicians Status</h2>
            </div>
            <Link
              href="/admin/doctors"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
            >
              Manage
            </Link>
          </div>

          <div className="space-y-3">
            {doctors.map((doc) => {
              const isOnline = doc.status === 'ONLINE';
              return (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={doc.image}
                      alt={doc.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 text-xs truncate">
                        {doc.name}
                      </div>
                      <div className="text-[11px] text-teal-400 truncate">
                        {doc.specialty}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleDoctorStatus(doc.id, doc.status)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-colors shrink-0 ${
                      isOnline
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {isOnline ? '● Online' : '○ Offline'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor Modal Dialog */}
      <DoctorFormModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
        }}
      />
    </div>
  );
}

