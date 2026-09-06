'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  Phone,
  MapPin,
  Calendar,
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { AppointmentHistoryModal } from '@/components/admin/AppointmentHistoryModal';

interface PatientRecord {
  id: string;
  name: string;
  phone: string | null;
  location: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    appointments: number;
  };
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Appointment history modal (opened by clicking the "N Booked" badge)
  const [historyPatient, setHistoryPatient] = useState<PatientRecord | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/patients');
      const data = await res.json();
      if (data.success && data.patients) {
        setPatients(data.patients);
      }
    } catch (err) {
      console.error('Error fetching patients list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (patient.name && patient.name.toLowerCase().includes(query)) ||
      (patient.phone && patient.phone.toLowerCase().includes(query)) ||
      (patient.location && patient.location.toLowerCase().includes(query))
    );
  });

  const totalAppointmentsCount = patients.reduce(
    (acc, p) => acc + (p._count?.appointments || 0),
    0
  );

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-100">Registered Patients</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
              {patients.length} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Overview of all patient accounts, verified phone numbers, and booking history.
          </p>
        </div>

        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Registered</p>
            <p className="text-xl font-bold text-slate-100">{patients.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Active Phone Accounts</p>
            <p className="text-xl font-bold text-slate-100">
              {patients.filter((p) => Boolean(p.phone)).length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Consultations</p>
            <p className="text-xl font-bold text-slate-100">{totalAppointmentsCount}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>Passwords securely encrypted &amp; hidden</span>
        </div>
      </div>

      {/* Patient Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <p className="text-xs font-semibold">Loading patient records...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No patients found</p>
            <p className="text-xs text-slate-500">
              {searchQuery ? 'Try changing your search query.' : 'No registered patients yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Patient Name</th>
                  <th className="py-3.5 px-4">Mobile Number</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Appointments</th>
                  <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredPatients.map((patient) => {
                  const initials = patient.name
                    ? patient.name.trim().charAt(0).toUpperCase()
                    : 'P';
                  const dateObj = new Date(patient.createdAt);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-800/40 transition-colors text-slate-300"
                    >
                      {/* Name & Avatar */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm shadow-teal-600/25">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100 leading-snug">
                              {patient.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              ID: {patient.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        {patient.phone ? (
                          <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                            <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                            <span>{patient.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Not provided</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-4">
                        {patient.location ? (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{patient.location}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Dhaka / Unspecified</span>
                        )}
                      </td>

                      {/* Appointments Count (clickable → booking history modal) */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            setHistoryPatient(patient);
                            setIsHistoryModalOpen(true);
                          }}
                          title={`View ${patient.name}'s appointment history`}
                          className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-teal-500/15 border border-slate-700 hover:border-teal-500/40 font-bold text-[11px] text-teal-300 transition-colors"
                        >
                          <CalendarCheck className="w-3 h-3 text-teal-400" />
                          {patient._count?.appointments || 0} Booked
                          <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                        </button>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col text-slate-300">
                          <span className="font-semibold text-slate-200">{formattedDate}</span>
                          <span className="text-[10px] text-slate-500">{formattedTime}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Appointment History Modal */}
      <AppointmentHistoryModal
        patient={historyPatient}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryPatient(null);
        }}
      />
    </div>
  );
}

