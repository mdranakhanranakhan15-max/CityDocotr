'use client';

import { Calendar, Star, Stethoscope, Award, BadgeCheck } from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

export interface DoctorCardDoctor {
  id: string;
  name: string;
  image?: string | null;
  degrees?: string | null;
  specialty?: string | null;
  specialties?: string | null;
  experienceYears?: number | null;
  rating?: number | null;
  reviewsCount?: number | null;
  totalVisits?: number | null;
  fee?: number | null;
  consultationFee?: number | null;
  workplace?: string | null;
  hospital?: string | null;
  isOnline?: boolean | null;
  status?: string | null;
}

export interface DoctorCardProps {
  doctor: DoctorCardDoctor;
  onBookClick: () => void;
}

export default function DoctorCard({ doctor, onBookClick }: DoctorCardProps) {
  const experienceYears = Number(doctor.experienceYears || 15);
  const degrees = doctor.degrees || 'MBBS, FCPS';
  const specialties = (doctor.specialties || doctor.specialty || 'General Physician')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  const rating = Number(doctor.rating || 5);
  const reviewsCount = Number(doctor.reviewsCount || 0);
  const totalVisits = Number(doctor.totalVisits || 0).toLocaleString();
  const fee = doctor.fee || doctor.consultationFee || 350;
  const workplace = doctor.workplace || doctor.hospital || 'CityDoctor Partner Hospital';

  const isOnline =
    doctor.isOnline === true || (doctor.status || '').toUpperCase() === 'ONLINE';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-teal-200 transition-all overflow-hidden flex flex-col">
      <div className="p-5 pb-4 flex items-start gap-4">
        {/* Avatar with floating online/offline status badge */}
        <div className="relative shrink-0">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doctor.image || FALLBACK_IMAGE}
              alt={doctor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <span
            className={`absolute -bottom-1.5 -right-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full border-2 border-white text-[9px] font-black uppercase tracking-wider shadow-sm ${
              isOnline ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-white/80'}`}
            />
            {isOnline ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Name / Degrees / Pill tags */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-[15px] font-extrabold text-slate-900 leading-snug line-clamp-1">
            {doctor.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{degrees}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {specialties.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold truncate max-w-[140px]"
              >
                <Stethoscope className="w-3 h-3 shrink-0" />
                <span className="truncate">{s}</span>
              </span>
            ))}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold">
              <BadgeCheck className="w-3 h-3 text-teal-600" />
              {experienceYears}+ yrs exp
            </span>
          </div>
        </div>
      </div>
      {/* Meta strip */}
      <div className="px-5 pb-4 flex items-center justify-between gap-3 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5 font-semibold min-w-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-slate-900 font-bold">{rating.toFixed(1)}</span>
          <span className="truncate">({reviewsCount}) {totalVisits} visits</span>
        </span>
        <span className="truncate text-right text-slate-500">
          at <span className="text-slate-800 font-semibold">{workplace}</span>
        </span>
      </div>

      {/* Fee + CTA Footer */}
      <div className="mt-auto px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Per Consultation
          </p>
          <p className="text-lg font-black text-slate-900 leading-tight">৳{fee}</p>
        </div>

        <button
          type="button"
          onClick={onBookClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/20 hover:shadow-md hover:shadow-teal-600/30 active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </button>
      </div>
    </div>
  );
}

