'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Stethoscope, Sparkles, Building, GraduationCap, Award, Upload } from 'lucide-react';

interface DoctorFormData {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  designation: string;
  degrees: string;
  specialty: string;
  specialties: string;
  workplace: string;
  experienceYears: number;
  fee: number;
  rating: number;
  totalVisits: number;
  isOnline: boolean;
  image: string;
  bio: string;
  badge?: string;
}

interface DoctorFormModalProps {
  isOpen: boolean;
  initialData?: DoctorFormData | null;
  onClose: () => void;
  onSuccess: () => void;
}

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

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
];

export const DoctorFormModal: React.FC<DoctorFormModalProps> = ({
  isOpen,
  initialData,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    designation: 'Consultant Specialist',
    degrees: 'MBBS, FCPS',
    specialty: 'General Physician',
    specialties: 'General Physician, Primary Care',
    workplace: 'Dhaka Medical College Hospital',
    experienceYears: 8,
    fee: 350,
    rating: 5.0,
    totalVisits: 1200,
    isOnline: true,
    image: DEFAULT_AVATARS[0],
    bio: 'Dedicated specialist providing comprehensive evidence-based clinical consultations.',
    badge: 'BMDC Verified',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        designation: initialData.designation || 'Consultant Specialist',
        degrees: initialData.degrees || 'MBBS, FCPS',
        specialties: initialData.specialties || initialData.specialty || 'General Physician',
        workplace: initialData.workplace || 'Dhaka Medical College Hospital',
        fee: initialData.fee || 350,
        rating: initialData.rating || 5.0,
        totalVisits: initialData.totalVisits || 0,
        isOnline: initialData.isOnline !== undefined ? initialData.isOnline : true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        designation: 'Consultant Specialist',
        degrees: 'MBBS, FCPS',
        specialty: 'General Physician',
        specialties: 'General Physician, Primary Care',
        workplace: 'Dhaka Medical College Hospital',
        experienceYears: 8,
        fee: 350,
        rating: 5.0,
        totalVisits: 1200,
        isOnline: true,
        image: DEFAULT_AVATARS[0],
        bio: 'Dedicated specialist providing comprehensive evidence-based clinical consultations.',
        badge: 'BMDC Verified',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData?.id;

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
      setFormData((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.specialty || !formData.workplace) {
      setError('Please fill in Name, Specialty, and Workplace.');
      return;
    }

    if (!isEditing && formData.email && !formData.password) {
      setError('An initial password is required when setting a login email.');
      return;
    }
    if (formData.password && formData.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Creates go through the Admin Panel route (/api/admin/doctors) which
      // hashes the initial password with bcrypt. Edits keep using /api/doctors.
      const url = isEditing ? `/api/doctors/${initialData.id}` : '/api/admin/doctors';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save doctor profile');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">
                {isEditing ? `Edit Doctor: ${initialData.name}` : 'Add New Certified Doctor'}
              </h3>
              <p className="text-xs text-slate-400">
                Configure designation, degrees, workplace hospital, and online availability.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="m-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Doctor Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Dr. Sarah Jenkins"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Doctor uses this email at /doctor/login.
              </p>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Mobile Number <span className="text-teal-400">(Phone)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +8801712345678"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500">
                Alternate contact for the doctor account.
              </p>
            </div>

            {/* Portal Login Password */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Portal Login Password <span className="text-teal-400">(hashed)</span>
              </label>
              <input
                type="password"
                placeholder="Set a temporary password"
                value={formData.password || ''}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Degrees */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Degrees & Qualifications <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MBBS, FCPS (Medicine), MD (Cardiology)"
                value={formData.degrees}
                onChange={(e) => setFormData({ ...formData, degrees: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Primary Department */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Department / Specialty <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.specialty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specialty: e.target.value,
                    specialties: formData.specialties || e.target.value,
                  })
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

            {/* Specialties (Badge tags) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Specialty Badges (Comma Separated)</label>
              <input
                type="text"
                placeholder="e.g. Cardiology, Hypertension, Preventative Heart"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Workplace / Hospital */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">
                Workplace / Hospital <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dhaka Medical College Hospital"
                value={formData.workplace}
                onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Consultation Fee (Taka) */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Consultation Fee (৳ Taka)</label>
              <input
                type="number"
                min="50"
                step="10"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Experience Years */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Years of Experience</label>
              <input
                type="number"
                min="1"
                value={formData.experienceYears}
                onChange={(e) =>
                  setFormData({ ...formData, experienceYears: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Total Visits Completed */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Total Visits Completed</label>
              <input
                type="number"
                min="0"
                value={formData.totalVisits}
                onChange={(e) =>
                  setFormData({ ...formData, totalVisits: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Rating (Out of 5.0)</label>
              <input
                type="number"
                min="1.0"
                max="5.0"
                step="0.1"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* isOnline Toggle Switch */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    formData.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-blue-600'
                  }`}
                />
                <span>Online Status: {formData.isOnline ? 'Online (Green Dot)' : 'Offline / Schedule Only (Blue Dot)'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {formData.isOnline
                  ? 'Patients can click "See Doctor Now" for instant live video call.'
                  : 'Patients can click "Book Appointment" to schedule for upcoming slot.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                formData.isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-blue-600/20 text-blue-300 border border-blue-600/40'
              }`}
            >
              {formData.isOnline ? 'Active Online' : 'Set Offline'}
            </button>
          </div>

          {/* Avatar Image: local file upload or URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Doctor Profile Photo</label>

            {/* Local device upload -> /api/upload */}
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
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500">Quick Avatars:</span>
              {DEFAULT_AVATARS.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setFormData({ ...formData, image: img })}
                  className={`w-7 h-7 rounded-lg overflow-hidden border ${
                    formData.image === img ? 'ring-2 ring-teal-400' : 'opacity-60'
                  }`}
                >
                  <img src={img} alt="avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Biography</label>
            <textarea
              rows={3}
              placeholder="Clinical background, patient focus, and treatment philosophy..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Save Changes' : 'Create Physician'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
