'use client';

import { Calendar, Star, Stethoscope } from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

/**
 * Strictly typed Doctor shape consumed by DoctorCard.
 * Mirrors the fields returned by the doctors API (Prisma Doctor model).
 */
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
}

export interface DoctorCardProps {
  doctor: DoctorCardDoctor;
  onBookClick: () => void;
}

export default function DoctorCard({ doctor, onBookClick }: DoctorCardProps) {
  const experienceYears = Number(doctor.experienceYears || 15);
  const degrees = doctor.degrees || 'MBBS, FCPS';
  const specialty = String(doctor.specialties || doctor.specialty || 'General Physician')
    .split(',')[0]
    .trim();
  const rating = Number(doctor.rating || 5);
  const reviewsCount = Number(doctor.reviewsCount || 0);
  const totalVisits = Number(doctor.totalVisits || 0).toLocaleString();
  const fee = doctor.fee || doctor.consultationFee || 350;
  const workplace = doctor.workplace || doctor.hospital || 'CityDoctor Partner Hospital';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* Body Section */}
      <div className="p-5 flex flex-1">
        {/* Left: Image + Status Dot + Experience */}
        <div className="flex flex-col items-center shrink-0 mr-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={doctor.image || FALLBACK_IMAGE}
              alt={doctor.name}
              className="w-full h-full object-cover"
            />
            <span
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white"
              title={doctor.isOnline === false ? 'Offline' : 'Online'}
            />
          </div>
          <p className="mt-2 text-sm font-bold text-slate-900 leading-tight whitespace-nowrap">
            {experienceYears}+ Years
          </p>
          <p className="text-xs text-gray-500">Experience</p>
        </div>

        {/* Right: Details */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-900 leading-snug line-clamp-1">{doctor.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-1">{degrees}</p>

          {/* Specialty badge with sharp right edge */}
          <span
            className="inline-block mt-2 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 truncate max-w-[200px]"
            style={{
              clipPath:
                'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)',
            }}
          >
            {specialty}
          </span>

          {/* Stats */}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-sm font-bold text-slate-900">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {rating}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium min-w-0">
              <Stethoscope className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate">
                ({reviewsCount}) {totalVisits} visits completed
              </span>
            </span>
          </div>

          {/* Workplace */}
          <p className="mt-1.5 text-xs text-gray-500">
            Working in <span className="text-slate-900 font-semibold">{workplace}</span>
          </p>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-gray-50 border-t border-gray-200 p-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">Per Consultation</p>
          <p className="text-xl font-bold text-slate-900">৳{fee}</p>
        </div>

        <button
          type="button"
          onClick={onBookClick}
          className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-50 active:scale-95 transition-all"
        >
          <Calendar className="w-4 h-4" />
          Book Appointment
        </button>
      </div>
    </div>
  );
}
