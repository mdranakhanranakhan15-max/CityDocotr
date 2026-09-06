'use client';

import React from 'react';
import Image from 'next/image';
import { Doctor } from '@/types/doctor';
import { Video, Star, Clock, Award, CheckCircle2, Building2 } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  isSelected: boolean;
  onSelect: (doctor: Doctor) => void;
  onStartConsultation: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  isSelected,
  onSelect,
  onStartConsultation,
}) => {
  const isOnline = doctor.status === 'online';
  const isBusy = doctor.status === 'busy';

  return (
    <div
      onClick={() => onSelect(doctor)}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-slate-800/90 border-teal-500/80 shadow-lg shadow-teal-500/10 ring-1 ring-teal-500/50'
          : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Top row: Avatar + Details */}
      <div className="flex items-start gap-3.5">
        {/* Avatar with Status Indicator */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/80 relative shadow-inner">
            <Image
              src={doctor.avatar}
              alt={doctor.name}
              fill
              sizes="56px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          {/* Status Indicator Dot */}
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${
              isOnline
                ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                : isBusy
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            title={`Status: ${doctor.status}`}
          >
            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
          </span>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-teal-300 transition-colors">
              {doctor.name}
            </h3>
            {doctor.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" aria-label="Verified Physician" />
            )}
          </div>

          <p className="text-xs font-medium text-teal-400 truncate mt-0.5">
            {doctor.specialty}
          </p>

          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3 h-3 fill-amber-400" />
              {doctor.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span>{doctor.reviewsCount} reviews</span>
            <span>•</span>
            <span>{doctor.experienceYears}y exp</span>
          </div>
        </div>
      </div>

      {/* Hospital & Bio */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{doctor.hospital}</span>
        </div>
        <div className="font-bold text-slate-200">
          ${doctor.consultationFee} <span className="text-[10px] font-normal text-slate-400">/ session</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
            {doctor.nextAvailable}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStartConsultation(doctor);
          }}
          disabled={!isOnline && !isBusy}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            isOnline
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white shadow-teal-500/20 active:scale-95'
              : isBusy
              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>{isBusy ? 'Join Queue' : 'Consult Now'}</span>
        </button>
      </div>
    </div>
  );
};

