'use client';

import {
  BadgeCheck,
  Star,
  CalendarDays,
  Building2,
  ShieldCheck,
  Eye,
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
  bmdc?: string | null;
  gender?: string | null;
}

export interface DoctorCardProps {
  doctor: DoctorCardDoctor;
  onBookClick: () => void;
}

/** DocTime design doctor card — white rounded-3xl card w/ avatar, Live badge,
 * credentials, stats bar, promo consultation fee and call / slot actions. */
export default function DoctorCard({ doctor, onBookClick }: DoctorCardProps) {
  const experienceYears = Number(doctor.experienceYears || 15);
  const degrees = doctor.degrees || 'MBBS, FCPS';
  const specialties = (doctor.specialties || doctor.specialty || 'General Physician')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  const rating = Number(doctor.rating || 0);
  const reviewsCount = Number(doctor.reviewsCount || 0);
  const totalVisits = Number(doctor.totalVisits || 0);
  const workplace =
    doctor.workplace || doctor.hospital || 'CityDoctor Partner Hospital';

  const isOnline =
    doctor.isOnline === true || (doctor.status || '').toUpperCase() === 'ONLINE';

  const waitLabel = isOnline ? 'Wait: < 3 mins' : 'Next: Today 5:00 PM';

  // Display fee. When the API exposes both a regular and a consultation fee we
  // show the discounted promo price with the original struck through.
  const rawFee = Number(doctor.consultationFee || 0);
  const rawRegular = Number(doctor.fee || 0);
  const hasPromo = rawFee > 0 && rawRegular > 0 && rawRegular > rawFee;
  const promoFee = hasPromo ? rawFee : rawFee || rawRegular || 0;
  const regularFee = hasPromo ? rawRegular : 0;
  const displayFee = hasPromo ? promoFee : rawRegular || rawFee;
  const feeForLabel = displayFee > 0 ? displayFee : 350;

  return (
    <div className="group relative bg-white border border-slate-200/80 hover:border-blue-200 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 p-5 flex flex-col gap-4">
      {/* ============ CARD HEADER ============ */}
      <div className="flex items-start justify-between gap-3">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={doctor.image || FALLBACK_IMAGE}
            alt={doctor.name}
            className="w-16 h-16 lg:w-[72px] lg:h-[72px] rounded-2xl object-cover ring-1 ring-slate-100 shadow-sm"
          />
          <span
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-2 ring-white flex items-center justify-center ${
              isOnline ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          >
            {isOnline && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </span>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-1">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-bold uppercase tracking-wide ${
              isOnline
                ? 'bg-red-50 text-red-600 border border-red-100'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOnline ? 'bg-red-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {isOnline ? 'Live' : 'Offline'}
          </span>
          <span className="text-[10.5px] text-slate-400 font-semibold">
            {waitLabel}
          </span>
        </div>
      </div>

      {/* Name / credentials / specialty / hospital */}
      <div className="min-w-0 -mt-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[15.5px] lg:text-[16px] font-extrabold text-slate-900 truncate group-hover:text-blue-700 transition-colors">
            {doctor.name}
          </h3>
          <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" aria-label="BMDC Verified Doctor" />
        </div>
        {doctor.bmdc && (
          <p className="flex items-center gap-1 text-[10.5px] text-slate-400 font-semibold mt-0.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            BMDC Reg: {doctor.bmdc}
          </p>
        )}
        <p className="text-[12px] text-slate-500 font-medium mt-1 leading-snug">{degrees}</p>
        <p className="text-[12.5px] text-blue-700 font-bold mt-0.5 truncate">
          {specialties[0]}
        </p>
        <p className="flex items-center gap-1 text-[11.5px] text-slate-400 mt-0.5 truncate">
          <Building2 className="w-3 h-3 shrink-0" />
          {workplace}
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 border border-slate-100 rounded-2xl px-2 py-2 text-center">
        <div className="min-w-0">
          <div className="text-[12.5px] text-slate-900 font-bold truncate">
            {experienceYears}+ yrs
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Experience
          </div>
        </div>
        <div className="min-w-0 border-x border-slate-200/70">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[12.5px] text-slate-900 font-bold">
              {rating > 0 ? rating.toFixed(1) : 'New'}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            {reviewsCount > 0 ? `${reviewsCount.toLocaleString()}+ Reviews` : 'Rating'}
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] text-slate-900 font-bold truncate">
            {totalVisits > 0 ? `${totalVisits.toLocaleString()}+` : '—'}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Consults
          </div>
        </div>
      </div>

      {/* ============ CARD FOOTER ============ */}
      <div className="pt-1">
        <span className="text-[10px] text-slate-400 uppercase tracking-wide font-bold block">
          Consultation Fee
        </span>
        {hasPromo ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[19px] font-extrabold text-slate-900 leading-tight">
              ৳{promoFee.toLocaleString()}
            </span>
            <span className="text-[12.5px] text-slate-400 line-through font-semibold">
              ৳{regularFee.toLocaleString()}
            </span>
          </div>
        ) : (
          <div className="text-[19px] font-extrabold text-slate-900 leading-tight">
            ৳{feeForLabel.toLocaleString()}
          </div>
        )}
        <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">
          {isOnline ? 'Flat 10% off on medicines' : 'No hidden charges'}
        </span>
      </div>


      {/* Actions — public cards never expose a direct video-call trigger. The
          only CTA is to book a slot / review the doctor; the live video room is
          reserved for paid, active appointment sessions (My Appointments). */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          type="button"
          onClick={onBookClick}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[12.5px] font-bold transition-all active:scale-[0.97] shadow-md shadow-blue-600/25"
        >
          {isOnline ? (
            <CalendarDays className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          {isOnline ? 'Book Slot' : 'View Profile'}
        </button>
      </div>
    </div>
  );
}

