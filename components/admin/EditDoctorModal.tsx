'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  Stethoscope,
  CalendarDays,
  Clock,
  Timer,
  Users,
  Banknote,
  Percent,
  Receipt,
  ShieldCheck,
  Video,
  Plane,
  CheckCircle2,
  Upload,
} from 'lucide-react';

// ---- Data model bound to the PUT /api/admin/doctors/[id] payload ----
interface DoctorFormData {
  id?: string;
  name: string;
  email?: string | null;
  password?: string;
  designation: string;
  degrees: string;
  specialty: string;
  specialties: string;
  workplace: string;
  hospital: string;
  experienceYears: number;
  fee: number;
  consultationFee: number;
  rating: number;
  totalVisits: number;
  isOnline: boolean;
  image: string;
  bio: string;
  languages: string;
  badge?: string;
  isVerified?: boolean;
  // Schedule & Slot Management
  bmdcRegNum: string;
  availableDays: string[];
  shiftStartTime: string;
  shiftEndTime: string;
  slotDuration: number;
  maxPatientsPerSlot: number;
  // Pricing & Tax Breakdown
  vatPercent: number;
  platformFee: number;
  doctorCommissionPercent: number;
  // Medical Compliance & Controls
  isInstantCallAvailable: boolean;
  isOnVacation: boolean;
}

interface EditDoctorModalProps {
  isOpen: boolean;
  doctor?: DoctorFormData | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOT_OPTIONS = [10, 15, 20, 30];

const SPECIALTIES = [
  'General Physician',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Gynae & Obs',
  'Neurology',
  'Psychiatry',
  'Orthopedics',
  'Internal Medicine',
  'Endocrinology',
  'Eye & ENT',
];

// Safe numeric coercion
const num = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const round2 = (n: number) => Math.round(n * 100) / 100;

// Parse "Sat, Sun, Mon" (DB string) -> string[] (modal state)
const parseDays = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value.map((d) => String(d).trim()).filter(Boolean);
  if (!value) return [];
  return value
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean);
};

// Convert a "HH:mm" (24h) or "H:mm AM/PM" / "HH:mm PM" (12h) time string to
// minutes since midnight, e.g. "09:00 PM" -> 21*60, "01:00 PM" -> 13*60.
const timeToMinutes = (t?: string) => {
  if (!t) return 0;
  const m = String(t)
    .trim()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])?$/);
  if (!m) return 0;
  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const meridian = (m[3] || '').toUpperCase();
  if (meridian === 'PM' && hours < 12) hours += 12;
  else if (meridian === 'AM' && hours === 12) hours = 0;
  else if (!meridian && hours > 23) return 0; // 24h-clock guard
  return hours * 60 + minutes;
};

export const EditDoctorModal: React.FC<EditDoctorModalProps> = ({
  isOpen,
  doctor,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<DoctorFormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !doctor) return;
    const d = doctor as any;
    setFormData({
      id: d.id,
      name: d.name || '',
      email: d.email || '',
      password: '',
      designation: d.designation || 'Consultant Specialist',
      degrees: d.degrees || 'MBBS, FCPS',
      specialty: d.specialty || 'General Physician',
      specialties: d.specialties || d.specialty || '',
      workplace: d.workplace || 'Dhaka Medical College Hospital',
      hospital: d.hospital || d.workplace || '',
      experienceYears: num(d.experienceYears, 5),
      fee: Math.round(num(d.consultationFee, d.fee || 350)),
      consultationFee: num(d.consultationFee, d.fee || 350),
      rating: num(d.rating, 5.0),
      totalVisits: num(d.totalVisits, 0),
      isOnline: d.isOnline !== undefined ? Boolean(d.isOnline) : true,
      image: d.image || '',
      bio: d.bio || '',
      languages: d.languages || 'English, Bengali',
      badge: d.badge || '',
      isVerified: d.isVerified !== undefined ? Boolean(d.isVerified) : true,
      bmdcRegNum: d.bmdcRegNum || '',
      availableDays: parseDays(d.availableDays),
      shiftStartTime: d.shiftStartTime || '10:00',
      shiftEndTime: d.shiftEndTime || '18:00',
      slotDuration: num(d.slotDuration, 15),
      maxPatientsPerSlot: num(d.maxPatientsPerSlot, 1),
      vatPercent: num(d.vatPercent, 5),
      platformFee: num(d.platformFee, 29),
      doctorCommissionPercent: 100, // no split — the doctor keeps the full consultation fee
      isInstantCallAvailable:
        d.isInstantCallAvailable !== undefined ? Boolean(d.isInstantCallAvailable) : true,
      isOnVacation: d.isOnVacation !== undefined ? Boolean(d.isOnVacation) : false,
    });
    setError(null);
  }, [doctor, isOpen]);

  if (!isOpen || !doctor || !formData) return null;

  const update = (key: keyof DoctorFormData, value: any) =>
    setFormData((prev) => (prev ? { ...prev, [key]: value } : prev));

  const toggleDay = (day: string) =>
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            availableDays: prev.availableDays.includes(day)
              ? prev.availableDays.filter((d) => d !== day)
              : [...prev.availableDays, day],
          }
        : prev
    );

  // ---- Live pricing calculations (Section B preview card) ----
  const consultFee = num(formData.consultationFee, 0);
  const vatPct = num(formData.vatPercent, 0);
  const platformCharge = num(formData.platformFee, 0);
  const vatAmount = round2(consultFee * (vatPct / 100));
  const patientTotal = round2(consultFee + vatAmount + platformCharge);
  // No platform split — the doctor earns the full consultation fee.
  const doctorEarnedAmount = round2(consultFee);

  // ---- Live schedule estimate (Section A helper line) ----
  // Parse both 24h ("21:00") and 12h ("09:00 PM") shift inputs. A shift whose
  // start is AFTER its end is an overnight shift that crosses midnight, so its
  // daily length spans to 24:00 and then continues from 00:00 until the end.
  const startMin = timeToMinutes(formData.shiftStartTime);
  const endMin = timeToMinutes(formData.shiftEndTime);
  const slotMins = Math.max(1, num(formData.slotDuration, 15));
  const overnightShift = endMin < startMin;
  const shiftMinutes =
    startMin === endMin
      ? 0
      : overnightShift
        ? 1440 - startMin + endMin
        : endMin - startMin;
  // Total bookable slots per full day: count the slot-start times that fit
  // inside the shift segments (same rule the booking grid uses).
  const slotsPerDay =
    shiftMinutes > 0
      ? overnightShift
        ? Math.floor((1440 - startMin) / slotMins) +
          Math.floor(endMin / slotMins)
        : Math.floor((endMin - startMin) / slotMins)
      : 0;
  const weeklyCapacity =
    slotsPerDay * formData.availableDays.length * Math.max(1, num(formData.maxPatientsPerSlot, 1));

  const fmtBdt = (n: number) =>
    `${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  // Upload a doctor photo picked from a local device (admin flow).
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Image upload failed');
      }
      update('image', data.url);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialty) {
      setError('Please fill in Doctor Name and Department / Specialty.');
      return;
    }
    if (formData.availableDays.length === 0) {
      setError('Please select at least one available day for the weekly schedule.');
      return;
    }
    if (!formData.bmdcRegNum.trim()) {
      setError('BMDC Registration Number is required for Bangladeshi medical compliance.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/doctors/${doctor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update doctor profile');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the doctor profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-100 text-base truncate">
                Edit Doctor: {doctor.name}
              </h3>
              <p className="text-xs text-slate-400">
                Configure schedule, pricing, VAT, BMDC compliance &amp; availability controls.
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

        {/* Error Alert */}
        {error && (
          <div className="mx-4 mt-4 mb-0 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* ============ BASIC PROFILE & CREDENTIALS ============ */}
          <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-100">Basic Profile &amp; Credentials</h4>
                <p className="text-[11px] text-slate-400">General identity, hospital &amp; professional details.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Doctor Full Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-300">
                  Doctor Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Dr. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => update('name', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Portal Login Email */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Portal Login Email <span className="text-teal-400">(Doctor Login)</span>
                </label>
                <input
                  type="email"
                  placeholder="doctor@citydoctor.com"
                  value={formData.email || ''}
                  onChange={(e) => update('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Portal Login Password (optional reset) */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Reset Portal Password <span className="text-teal-400">(optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password || ''}
                  onChange={(e) => update('password', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Designation <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Consultant & Head of Dept"
                  value={formData.designation}
                  onChange={(e) => update('designation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Degrees */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Degrees &amp; Qualifications <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBBS, FCPS (Medicine), MD (Cardiology)"
                  value={formData.degrees}
                  onChange={(e) => update('degrees', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              {/* Department / Specialty */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Department / Specialty <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData((prev) =>
                      prev
                        ? {
                            ...prev,
                            specialty: e.target.value,
                            specialties: prev.specialties || e.target.value,
                          }
                        : prev
                    )
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {SPECIALTIES.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty Badges */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">
                  Specialty Badges <span className="text-slate-500">(comma separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cardiology, Hypertension, Preventative Heart"
                  value={formData.specialties}
                  onChange={(e) => update('specialties', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              {/* Workplace / Hospital */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-300">
                  Workplace / Hospital <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhaka Medical College Hospital"
                  value={formData.workplace}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData((prev) => (prev ? { ...prev, workplace: v, hospital: v } : prev));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              {/* Experience Years */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(e) => update('experienceYears', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              {/* Rating */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Rating (out of 5.0)</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => update('rating', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              {/* Total Visits */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300">Total Visits Completed</label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalVisits}
                  onChange={(e) => update('totalVisits', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                />
              </div>

              {/* Profile Photo — local file upload or URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-300">Doctor Profile Photo</label>
                <div className="flex items-start gap-3">
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="avatar preview"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                      onError={(e) => ((e.target as HTMLImageElement).style.opacity = '0.15')}
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    {/* Local file picker -> /api/upload -> /uploads/... URL */}
                    <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-teal-500/40 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-xs font-bold cursor-pointer transition-colors">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isUploading ? 'Uploading…' : 'Upload photo from device'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                      />
                    </label>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="h-px flex-1 bg-slate-800" />
                      or paste an image URL
                      <span className="h-px flex-1 bg-slate-800" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://... or /uploads/filename.jpg"
                      value={formData.image}
                      onChange={(e) => update('image', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500">
                      JPG / PNG / WebP / GIF • max 5 MB. Uploaded photos are stored in{' '}
                      <code className="text-teal-400">/public/uploads</code> and saved as a
                      relative <code className="text-teal-400">/uploads/…</code> URL.
                    </p>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-300">Biography</label>
                <textarea
                  rows={2}
                  placeholder="Clinical background, patient focus, and treatment philosophy..."
                  value={formData.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {/* ============ SECTION A: SCHEDULE & SLOT MANAGEMENT ============ */}
          <section className="rounded-2xl border border-violet-500/25 bg-violet-950/20 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-100">Schedule &amp; Slot Management</h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded-md">
                    Section A
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Weekly availability, shift timing and consultation slot sizing.</p>
              </div>
            </div>

            {/* Available Days checkbox pills */}
            <div className="space-y-2">
              <label className="font-semibold text-slate-300">
                Available Days <span className="text-rose-400">*</span>
                <span className="ml-1 text-[10px] text-slate-500 font-normal">(select multiple days)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const active = formData.availableDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                        active
                          ? 'bg-violet-500/25 text-violet-200 border-violet-400/60 shadow-md shadow-violet-500/10'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : ''}
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Shift Timing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" /> Shift Start Time
                </label>
                <input
                  type="time"
                  value={formData.shiftStartTime}
                  onChange={(e) => update('shiftStartTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" /> Shift End Time
                </label>
                <input
                  type="time"
                  value={formData.shiftEndTime}
                  onChange={(e) => update('shiftEndTime', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Slot Duration & max patients per slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-violet-400" /> Slot Duration <span className="text-slate-500 font-normal">(per patient)</span>
                </label>
                <select
                  value={formData.slotDuration}
                  onChange={(e) => update('slotDuration', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-violet-500 focus:outline-none"
                >
                  {SLOT_OPTIONS.map((mins) => (
                    <option key={mins} value={mins}>
                      {mins} Mins
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-400" /> Max Patients per Slot
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxPatientsPerSlot}
                  onChange={(e) => update('maxPatientsPerSlot', e.target.value === '' ? 1 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-violet-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Weekly capacity estimate */}
            <div className="rounded-xl bg-slate-950/70 border border-violet-500/20 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-violet-400" /> Weekly capacity estimate
              </span>
              <span className="text-violet-200 font-bold font-mono">
                {formData.availableDays.length} day(s) • {shiftMinutes} min/day • ≈ {weeklyCapacity} patient slots/week
              </span>
            </div>
          </section>

          {/* ============ SECTION B: PRICING & TAX BREAKDOWN ============ */}
          <section className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-100">Pricing &amp; Tax Breakdown</h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-md">
                    Section B
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Consultation fee, VAT and platform charge — the doctor earns 100% of the consultation fee.</p>
              </div>
            </div>

            {/* Fee / VAT / Platform Charge inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-amber-400" /> Consultation Fee (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.consultationFee}
                  onChange={(e) => update('consultationFee', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" /> VAT (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={formData.vatPercent}
                  onChange={(e) => update('vatPercent', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-400" /> Platform Charge (BDT)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.platformFee}
                  onChange={(e) => update('platformFee', e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Live Total Preview Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/15 via-cyan-500/10 to-slate-950 border border-emerald-400/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Live Total Preview
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Auto-calculated</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Doctor Consultation Fee</span>
                  <span className="font-mono font-semibold">৳{fmtBdt(consultFee)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>VAT ({fmtBdt(vatPct)}%)</span>
                  <span className="font-mono">৳{fmtBdt(vatAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Platform Service Charge</span>
                  <span className="font-mono">৳{fmtBdt(platformCharge)}</span>
                </div>
                <div className="border-t border-emerald-400/20 pt-2 mt-2 flex items-end justify-between">
                  <span className="font-extrabold text-emerald-200">Total Patient Payable</span>
                  <span className="font-extrabold text-2xl text-emerald-300 font-mono">৳{fmtBdt(patientTotal)}</span>
                </div>
              </div>
            </div>
            {/* Doctor Earned Amount — full consultation fee, no platform split */}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-3.5 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-slate-100">
                    Doctor Earned Amount <span className="text-slate-500 font-normal">(per consultation)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    100% of the Consultation Fee — the percentage payout split has been removed.
                  </p>
                </div>
              </div>
              <div className="text-2xl font-extrabold text-emerald-300 font-mono shrink-0">
                ৳{fmtBdt(doctorEarnedAmount)}
              </div>
            </div>
          </section>

          {/* ============ SECTION C: MEDICAL COMPLIANCE & CONTROLS ============ */}
          <section className="rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-100">Medical Compliance &amp; Controls</h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                    Section C
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">BMDC verification, instant video access and vacation pause mode.</p>
              </div>
            </div>

            {/* BMDC Registration Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> BMDC Registration Number
                <span className="text-rose-400">*</span>
                <span className="text-slate-500 font-normal text-[10px]">(essential for BD medical compliance)</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="e.g. A-12345/2020"
                  value={formData.bmdcRegNum}
                  onChange={(e) => update('bmdcRegNum', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
                {formData.bmdcRegNum.trim() ? (
                  <span className="shrink-0 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="shrink-0 px-2.5 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                    Required
                  </span>
                )}
              </div>
            </div>

            {/* Instant Video Call Toggle */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    formData.isInstantCallAvailable
                      ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  <Video className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">Instant Video Call</div>
                  <p className="text-[11px] text-slate-400">
                    Enables the &quot;See Doctor Now&quot; feature so patients can join a live video call instantly.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={formData.isInstantCallAvailable}
                onChange={() => update('isInstantCallAvailable', !formData.isInstantCallAvailable)}
                accent="teal"
              />
            </div>

            {/* Vacation / Pause Bookings Toggle */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    formData.isOnVacation
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  <Plane className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">Vacation Mode</div>
                  <p className="text-[11px] text-slate-400">
                    Temporarily pause new appointment bookings while this doctor is on leave. Existing consultations remain.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={formData.isOnVacation}
                onChange={() => update('isOnVacation', !formData.isOnVacation)}
                accent="rose"
              />
            </div>
            {/* Online Status Toggle */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      formData.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">
                    Online Status: {formData.isOnline ? 'Online (Live Video)' : 'Offline / Schedule Only'}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {formData.isOnline
                      ? 'Patients can start an instant video call or book an appointment right away.'
                      : 'The doctor will only appear for scheduled appointment bookings.'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={formData.isOnline}
                onChange={() => update('isOnline', !formData.isOnline)}
                accent="emerald"
              />
            </div>

            {/* BMDC Verified Badge Toggle */}
            <div className="rounded-xl bg-slate-950/70 border border-slate-800 px-3.5 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-200">BMDC Verified Badge</div>
                  <p className="text-[11px] text-slate-400">
                    Shows the green verified check mark next to the doctor&apos;s name across the platform.
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={!!formData.isVerified}
                onChange={() => update('isVerified', !formData.isVerified)}
                accent="emerald"
              />
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-slate-900/95 backdrop-blur">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-teal-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ---- Reusable animated toggle switch ----
function ToggleSwitch({
  checked,
  onChange,
  accent = 'teal',
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  accent?: 'teal' | 'emerald' | 'rose' | 'cyan';
  disabled?: boolean;
}) {
  const onColors: Record<string, string> = {
    teal: 'bg-teal-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    cyan: 'bg-cyan-500',
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-40 ${
        checked ? onColors[accent] || onColors.teal : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );
}
