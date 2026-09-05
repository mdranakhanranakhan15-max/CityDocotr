'use client';

import React, { useState, useMemo } from 'react';
import { Doctor, Specialty } from '@/types/doctor';
import { DoctorCard } from './DoctorCard';
import { Search, SlidersHorizontal, Stethoscope, Users, Sparkles } from 'lucide-react';

interface DoctorListProps {
  doctors: Doctor[];
  selectedDoctor: Doctor;
  onSelectDoctor: (doctor: Doctor) => void;
  onStartConsultation: (doctor: Doctor) => void;
}

const SPECIALTIES: Specialty[] = [
  'All Specialties',
  'Cardiologist',
  'Dermatologist',
  'General Physician',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic Surgeon',
];

export const DoctorList: React.FC<DoctorListProps> = ({
  doctors,
  selectedDoctor,
  onSelectDoctor,
  onStartConsultation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty>('All Specialties');
  const [onlineOnly, setOnlineOnly] = useState(false);

  // Filter doctors
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All Specialties' || doc.specialty === selectedSpecialty;

      const matchesStatus = !onlineOnly || doc.status === 'online';

      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }, [doctors, searchQuery, selectedSpecialty, onlineOnly]);

  const onlineCount = doctors.filter((d) => d.status === 'online').length;

  return (
    <aside className="w-full lg:w-[380px] xl:w-[420px] flex flex-col h-full bg-slate-900/95 border-r border-slate-800/80 z-20 shrink-0 select-none">
      {/* Header section */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" />
            <h2 className="font-bold text-slate-100 text-base">Active Physicians</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
            {filteredDoctors.length} available
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor, specialty, hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950/70 border border-slate-750 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
          />
        </div>

        {/* Filter Controls: Specialty Pills & Online Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-teal-400" />
              Specialty Filter
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={onlineOnly}
                onChange={(e) => setOnlineOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-teal-500 focus:ring-teal-500/40"
              />
              <span className="text-[11px]">Online ({onlineCount})</span>
            </label>
          </div>

          {/* Specialty Horizontal Scroll Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
            {SPECIALTIES.map((specialty) => {
              const isActive = selectedSpecialty === specialty;
              return (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-slate-700/50'
                  }`}
                >
                  {specialty}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Doctor List (Vertically Scrollable) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              isSelected={selectedDoctor.id === doc.id}
              onSelect={onSelectDoctor}
              onStartConsultation={onStartConsultation}
            />
          ))
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-400">
            <Users className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No doctors found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Try adjusting your search query or removing filters to view available physicians.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpecialty('All Specialties');
                setOnlineOnly(false);
              }}
              className="mt-3 text-xs text-teal-400 hover:text-teal-300 font-medium underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Average wait time: &lt; 2 mins</span>
        </div>
        <span className="text-emerald-400 font-medium">99.8% Uptime</span>
      </div>
    </aside>
  );
};

