'use client';

import React from 'react';
import {
  Search,
  SlidersHorizontal,
  Stethoscope,
  HeartPulse,
  Activity,
  Brain,
  Baby,
  Smile,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DoctorFilterSidebarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSpecialty: string;
  onSpecialtyChange: (s: string) => void;
  onlineOnly: boolean;
  onOnlineOnlyChange: (o: boolean) => void;
  maxFee: number;
  onMaxFeeChange: (fee: number) => void;
  onReset: () => void;
  totalDoctors: number;
  onlineDoctorsCount: number;
}

const SPECIALTIES = [
  { name: 'All Specialties', icon: Stethoscope },
  { name: 'General Physician', icon: Activity },
  { name: 'Cardiologist', icon: HeartPulse },
  { name: 'Dermatologist', icon: Sparkles },
  { name: 'Neurologist', icon: Brain },
  { name: 'Pediatrician', icon: Baby },
  { name: 'Psychiatrist', icon: Smile },
  { name: 'Orthopedic Surgeon', icon: ShieldCheck },
];

export const DoctorFilterSidebar: React.FC<DoctorFilterSidebarProps> = ({
  searchQuery,
  onSearchChange,
  selectedSpecialty,
  onSpecialtyChange,
  onlineOnly,
  onOnlineOnlyChange,
  maxFee,
  onMaxFeeChange,
  onReset,
  totalDoctors,
  onlineDoctorsCount,
}) => {
  return (
    <aside className="w-full lg:w-72 xl:w-80 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-5 shrink-0 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <h2 className="font-bold text-slate-100 text-sm">Filter Doctors</h2>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Doctor name, hospital..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
          />
        </div>
      </div>

      {/* Online Status Toggle (DocTime Instant Consult) */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-slate-100 text-xs flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Instant Consult
            </span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={onlineOnly}
              onChange={(e) => onOnlineOnlyChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
        <p className="text-[11px] text-slate-400">
          Showing <span className="text-emerald-300 font-bold">{onlineDoctorsCount}</span> online doctors available for immediate video call.
        </p>
      </div>

      {/* Specialties List */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Medical Specialties
        </label>
        <div className="space-y-1">
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.name;
            const Icon = spec.icon;
            return (
              <button
                key={spec.name}
                onClick={() => onSpecialtyChange(spec.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-teal-400' : 'text-slate-500'
                    }`}
                  />
                  <span>{spec.name}</span>
                </div>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Consultation Fee Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-semibold">Max Consultation Fee</span>
          <span className="font-mono font-bold text-teal-300">${maxFee} USD</span>
        </div>
        <input
          type="range"
          min="40"
          max="120"
          step="5"
          value={maxFee}
          onChange={(e) => onMaxFeeChange(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>$40</span>
          <span>$80</span>
          <span>$120+</span>
        </div>
      </div>
    </aside>
  );
};

