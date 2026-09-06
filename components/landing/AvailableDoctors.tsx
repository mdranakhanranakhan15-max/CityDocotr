'use client';

import React from 'react';
import {
  Video,
  Star,
  Building2,
  CheckCircle2,
  GraduationCap,
  Zap,
  SlidersHorizontal,
  Loader2,
  Search,
} from 'lucide-react';

interface AvailableDoctorsProps {
  doctors: any[];
  isLoading: boolean;
  selectedSpecialty: string;
  onSpecialtyChange: (spec: string) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (o: boolean) => void;
  onOpenPaymentCheckout: (doctor: any) => void;
}

const SPECIALTY_TABS = [
  'All Specialties',
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic Surgeon',
];

export const AvailableDoctors: React.FC<AvailableDoctorsProps> = ({
  doctors,
  isLoading,
  selectedSpecialty,
  onSpecialtyChange,
  onlineOnly,
  onOnlineOnlyChange,
  onOpenPaymentCheckout,
}) => {
  const onlineCount = doctors.filter(
    (d) => d.status === 'ONLINE' || d.status === 'online'
  ).length;

  return (
    <section id="doctors" className="py-14 sm:py-20 bg-slate-900/60 border-t border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-teal-400" />
              <span>Instant Video Sessions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Available Doctors
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Select a doctor to start an instant video consultation or book a scheduled appointment.
            </p>
          </div>

          {/* Online-Only Toggle Switch */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-slate-200">
              Online Only ({onlineCount})
            </span>
            <label className="relative inline-flex items-center cursor-pointer ml-1">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => onOnlineOnlyChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Specialties Horizontal Scroll Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SPECIALTY_TABS.map((tab) => {
            const isActive = selectedSpecialty === tab;
            return (
              <button
                key={tab}
                onClick={() => onSpecialtyChange(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Doctors Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 bg-slate-950/40 rounded-3xl border border-slate-800">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
            <p className="text-sm font-semibold text-slate-300">
              Loading certified doctors from CityDoctor database...
            </p>
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {doctors.map((doc) => {
              const isOnline = doc.status === 'ONLINE' || doc.status === 'online';
              const isBusy = doc.status === 'BUSY' || doc.status === 'busy';
              const usdFee = doc.consultationFee || 50;
              const bdtFee = Math.round(usdFee * 120);

              return (
                <div
                  key={doc.id}
                  className="p-5 rounded-3xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800/90 hover:border-teal-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between group hover:shadow-teal-500/10"
                >
                  {/* Top Details */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/80 relative shadow-inner">
                          <img
                            src={doc.image || doc.avatar}
                            alt={doc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        {/* Status Indicator */}
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center ${
                            isOnline
                              ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                              : isBusy
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          title={`Status: ${doc.status}`}
                        >
                          {isOnline && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          )}
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-100 text-sm sm:text-base group-hover:text-teal-300 transition-colors truncate">
                            {doc.name}
                          </h3>
                          {doc.isVerified && (
                            <span title="Verified Physician">
                              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-semibold text-teal-400 mt-0.5 truncate">
                          {doc.specialty}
                        </p>

                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                          <Building2 className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{doc.hospital}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 text-amber-400 font-semibold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {Number(doc.rating || 4.9).toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{doc.experienceYears || 5}y exp</span>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Education */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                      {doc.education && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{doc.education}</span>
                        </div>
                      )}
                      <p className="text-[11.5px] text-slate-300 line-clamp-2 leading-relaxed">
                        {doc.bio}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action & Consultation Fee */}
                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">
                        Consult Fee
                      </div>
                      <div className="font-mono font-extrabold text-base text-slate-100">
                        ৳ {bdtFee.toLocaleString()}{' '}
                        <span className="text-[10px] font-normal text-slate-400">(${usdFee})</span>
                      </div>
                    </div>

                    {/* Consult Now Button -> triggers bKash/Card Payment Modal */}
                    <button
                      onClick={() => onOpenPaymentCheckout(doc)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                        isOnline
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 shadow-teal-500/20'
                          : isBusy
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 hover:bg-slate-750 text-slate-300'
                      }`}
                    >
                      <Video className="w-4 h-4 text-slate-950" />
                      <span>{isOnline ? 'Consult Now' : 'Book Consult'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-6 text-center rounded-3xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-200 text-base">No doctors found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No physicians match the selected specialty or online filter. Try switching back to &ldquo;All Specialties&rdquo;.
            </p>
            <button
              onClick={() => {
                onSpecialtyChange('All Specialties');
                onOnlineOnlyChange(false);
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold text-xs border border-teal-500/40"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

