'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Loader2,
  Building,
} from 'lucide-react';
import { DoctorFormModal } from '@/components/admin/DoctorFormModal';
import { EditDoctorModal } from '@/components/admin/EditDoctorModal';

// Defensive normalizer: older / partial DB records may not yet contain the
// newly added schedule, pricing, or compliance columns (availableDays,
// vatPercent, platformFee, bmdcRegNum, ...). Map every value to a safe schema
// default so the directory always renders and the edit modal opens without
// throwing on null / undefined fields.
const normalizeDoctor = (doc: any): any => {
  const d = doc && typeof doc === 'object' ? doc : {};
  const toNumber = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const toBool = (v: any, fallback: boolean) =>
    v === undefined || v === null ? fallback : Boolean(v);

  const fee = toNumber(d.fee) > 0 ? toNumber(d.fee) : toNumber(d.consultationFee);
  const consultationFee =
    toNumber(d.consultationFee) > 0 ? toNumber(d.consultationFee) : fee;

  return {
    ...d,
    id: d.id || '',
    name: d.name || 'Unknown Doctor',
    email: d.email ?? null,
    phone: d.phone ?? null,
    designation: d.designation || 'Consultant',
    degrees: d.degrees || 'MBBS',
    specialty: d.specialty || 'General Physician',
    specialties: d.specialties || d.specialty || 'General Physician',
    workplace: d.workplace || 'CityDoctor Telehealth',
    hospital: d.hospital || d.workplace || 'CityDoctor Telehealth',
    education: d.education || '',
    experienceYears: toNumber(d.experienceYears),
    rating: toNumber(d.rating) || 5.0,
    totalVisits: toNumber(d.totalVisits),
    reviewsCount: toNumber(d.reviewsCount),
    fee,
    consultationFee,
    image: d.image || '',
    bio: d.bio || '',
    languages: d.languages || 'English, Bengali',
    badge: d.badge || '',
    isVerified: toBool(d.isVerified, true),
    isOnline: toBool(d.isOnline, true),
    status: d.status || 'ONLINE',
    // Schedule & slot management
    availableDays: d.availableDays || 'Sat, Sun, Mon, Tue',
    shiftStartTime: d.shiftStartTime || '10:00',
    shiftEndTime: d.shiftEndTime || '18:00',
    slotDuration: toNumber(d.slotDuration) || 15,
    maxPatientsPerSlot: toNumber(d.maxPatientsPerSlot) || 1,
    // Pricing & tax breakdown
    vatPercent: toNumber(d.vatPercent) || 5,
    platformFee: toNumber(d.platformFee) || 29,
    // Payout split removed — doctor keeps 100% of the consultation fee.
    doctorCommissionPercent: toNumber(d.doctorCommissionPercent) || 100,
    // BMDC & medical compliance
    bmdcRegNum: d.bmdcRegNum || '',
    isInstantCallAvailable: toBool(d.isInstantCallAvailable, true),
    isOnVacation: toBool(d.isOnVacation, false),
    _count: d._count,
  };
};

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedSpecialty !== 'All') params.set('specialty', selectedSpecialty);
      if (selectedStatus === 'ONLINE') params.set('isOnline', 'true');
      if (selectedStatus === 'OFFLINE') params.set('isOnline', 'false');

      const res = await fetch(`/api/doctors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleToggleOnline = async (id: string, currentOnline: boolean) => {
    const nextOnline = !currentOnline;
    try {
      await fetch(`/api/doctors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: nextOnline }),
      });
      fetchDoctors();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchDoctors();
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <Users className="w-4 h-4" />
            <span>Doctor Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
            Manage Physician Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create, edit doctor credentials, workplace, degrees, consultation fees, and toggle online availability.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDoctor(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, hospital, degrees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-750 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="ALL">All Online Statuses</option>
            <option value="ONLINE">Online Only</option>
            <option value="OFFLINE">Offline Only</option>
          </select>

          {/* Specialty Filter */}
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-750 text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="All">All Specialties</option>
            <option value="General Physician">General Physician</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Gynae & Obs">Gynae & Obs</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Physician</th>
                <th className="py-3 px-3">Degrees & Designation</th>
                <th className="py-3 px-3">Workplace</th>
                <th className="py-3 px-3">Fee</th>
                <th className="py-3 px-3">Visits & Rating</th>
                <th className="py-3 px-3">Online Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                    <span>Loading physician records from database...</span>
                  </td>
                </tr>
              ) : doctors.length > 0 ? (
                doctors.map((rawDoc) => {
                  const doc = normalizeDoctor(rawDoc);
                  const isOnline = doc.isOnline !== false;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-850/50 transition-colors">
                      {/* Avatar & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {doc.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={doc.image}
                                alt={doc.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-slate-950 font-black flex items-center justify-center text-sm border border-slate-700 shrink-0">
                                {(doc.name || 'D').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span
                              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                                isOnline ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{doc.name}</span>
                              {doc.isVerified && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                              )}
                            </div>
                            <div className="text-[11px] text-teal-300 font-semibold">{doc.specialty}</div>
                          </div>
                        </div>
                      </td>

                      {/* Degrees & Designation */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{doc.designation || 'Consultant'}</div>
                        <div className="text-[11px] text-slate-400">{doc.degrees || 'MBBS'}</div>
                      </td>

                      {/* Workplace */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-300 line-clamp-2 max-w-xs flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{doc.workplace || doc.hospital}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{doc.experienceYears}+ Years Exp</div>
                      </td>

                      {/* Fee */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        ৳{doc.fee || doc.consultationFee}
                      </td>

                      {/* Visits & Rating */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{Number(doc.rating || 5.0).toFixed(1)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {doc.totalVisits || 0} visits
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleOnline(doc.id, isOnline)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 ${
                            isOnline
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-blue-600/20 text-blue-300 border border-blue-600/40 hover:bg-blue-600/30'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'
                            }`}
                          />
                          <span>{isOnline ? 'Online' : 'Offline'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingDoctor(doc);
                              setEditModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors"
                            title="Edit doctor profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(doc.id, doc.name)}
                            disabled={deletingId === doc.id}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                            title="Delete doctor"
                          >
                            {deletingId === doc.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No doctor records match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Doctor Modal */}
      <DoctorFormModal
        isOpen={modalOpen}
        initialData={editingDoctor}
        onClose={() => {
          setModalOpen(false);
          setEditingDoctor(null);
        }}
        onSuccess={() => {
          fetchDoctors();
        }}
      />

      {/* Edit Doctor Modal (Schedules / Fees / VAT / BMDC Compliance) */}
      <EditDoctorModal
        isOpen={editModalOpen}
        doctor={editingDoctor}
        onClose={() => {
          setEditModalOpen(false);
          setEditingDoctor(null);
        }}
        onSuccess={() => {
          fetchDoctors();
        }}
      />
    </div>
  );
}
