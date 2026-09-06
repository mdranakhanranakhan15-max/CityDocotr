'use client';

import {
  CalendarCheck,
  Star,
  Stethoscope,
  Award,
  BadgeCheck,
  MapPin,
  Video,
} from 'lucide-react';

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
    <div className="group relative flex flex-col overflow-hidden rounded-[1.75rem] bg-white border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-teal-600/10 hover:border-teal-200 hover:-translate-y-1.5 transition-all duration-300 select-none">
      {/* soft radial accent for the bento header */}
      <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-teal-100/90 via-cyan-50/70 to-transparent blur-2xl pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity duration-300" />

      {/* ============ TOP HEADER BAND ============ */}
      <div className="relative h-32 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="absolute -bottom-8 -left-6 w-28 h-28 rounded-full border-[10px] border-white/10" />
        <div className="absolute -top-6 right-8 w-16 h-16 rounded-full border-[6px] border-white/10" />
      </div>

      {/* floating doctor photo, overlapping the band */}
      <div className="relative -mt-9 px-5 flex items-end justify-between">
        <div className="relative shrink-0">
          <div className="w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl shadow-slate-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doctor.image || FALLBACK_IMAGE}
              alt={doctor.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* dynamic floating status dot overlaid top-right */}
          <span
            className={`absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full ring-[3px] ring-white flex items-center justify-center ${
              isOnline
                ? 'bg-emerald-500 shadow-md shadow-emerald-500/40'
                : 'bg-rose-500 shadow-md shadow-rose-500/30'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-white animate-pulse' : 'bg-white/80'
              }`}
            />
          </span>
        </div>

        {/* experience / rating bento badges */}
        <div className="flex items-center gap-2 pb-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-sm text-[10px] font-black text-slate-700">
            <BadgeCheck className="w-3 h-3 text-teal-600" />
            {experienceYears}+ yrs
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 shadow-sm text-[10px] font-black text-amber-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* ============ CONTENT AREA ============ */}
      <div className="px-5 pt-3.5 flex flex-col gap-2.5 min-w-0">
        <div>
          <div className="flex items-start gap-1.5 min-w-0">
            <h3 className="text-[15px] font-black text-slate-900 leading-snug line-clamp-1">
              {doctor.name}
            </h3>
            <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" aria-label="Verified" />
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 min-w-0">
            <Award className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{degrees}</span>
          </p>
        </div>

        {/* specialty pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {specialties.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold truncate max-w-[150px]"
            >
              <Stethoscope className="w-3 h-3 shrink-0" />
              <span className="truncate">{s}</span>
            </span>
          ))}
        </div>

        {/* rating / visits meta row */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1.5 font-semibold min-w-0">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-slate-900 font-bold">{rating.toFixed(1)}</span>
            <span className="truncate">({reviewsCount}) · {totalVisits} visits</span>
          </span>
          <span
            className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
              isOnline
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-slate-500 bg-slate-50 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">at {workplace}</span>
        </div>
      </div>

      {/* ============ CARD FOOTER ============ */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div className="px-5 pb-5 flex items-end justify-between gap-3">
          <div className="shrink-0">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider flex items-center gap-1">
              <CalendarCheck className="w-3 h-3 text-teal-600" />
              Per Consultation
            </p>
            <p className="text-xl font-black text-slate-900 leading-tight mt-0.5">
              ৳{fee.toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onBookClick}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white text-xs font-bold shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 active:scale-[0.97] transition-all"
          >
            <Video className="w-4 h-4" />
            <span className="sm:hidden">Book Now</span>
            <span className="hidden sm:inline">Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
}

