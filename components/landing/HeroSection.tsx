'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Search,
  Video,
  ShieldCheck,
  Zap,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const quickTags = [
    'General Physician',
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Fever & Cough',
    'Skin Rash',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localQuery);
    onSearchSubmit(localQuery);
  };

  const handleTagClick = (tag: string) => {
    setLocalQuery(tag);
    onSearchChange(tag);
    onSearchSubmit(tag);
  };

  return (
    <section className="relative overflow-hidden pt-6 sm:pt-10 lg:pt-14 pb-12 sm:pb-16 lg:pb-20 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/80 to-slate-950">
      {/* Background ambient lighting orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline, Search Bar, Quick Tags */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>Instant Video Consultation in under 2 Minutes</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl xl:text-7xl font-extrabold text-slate-100 tracking-tight leading-[1.05]">
              Consult Top Doctors Online,{' '}
              <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
                Anytime, Anywhere.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Connect instantly with board-certified specialist physicians via encrypted video call.
              Get digital prescriptions, clinical advice, and pay securely using{' '}
              <strong className="text-white">bKash</strong> or <strong className="text-white">Debit/Credit Card</strong>.
            </p>

            {/* Interactive Search Bar */}
            <form
              onSubmit={handleSubmit}
              className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                <input
                  type="text"
                  placeholder="Search by Doctor Name, Specialty, or Symptoms (e.g., Fever, Skin, Heart)..."
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-95 transition-all shrink-0"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Symptom Tags */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
              <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Popular Searches:
              </span>
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-teal-300 border border-slate-800 hover:border-teal-500/30 text-[11px] transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Key Trust Signals */}
            <div className="pt-2 flex items-center gap-5 sm:gap-8 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>&lt; 90s Wait Time</span>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>BMDC / Board Certified</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-slate-200 font-semibold">4.9 / 5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Medical Visual with Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Visual Container */}
            <div className="relative w-full max-w-md aspect-[4/5] rounded-3xl overflow-hidden border-2 border-slate-700/60 shadow-2xl bg-gradient-to-tr from-slate-900 to-slate-800 group">
              {/* Doctor Main Photo */}
              <Image
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800"
                alt="CityDoctor Telehealth Consultation"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 500px"
                className="object-cover object-top filter contrast-[1.02] brightness-95 group-hover:scale-105 transition-transform duration-500"
              />

              {/* Gradient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

              {/* Floating Badge 1: Top Doctor Online (Top Left) */}
              <div className="absolute top-4 left-4 z-20 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-left duration-300">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="font-bold text-slate-100 text-[11px]">100+ Physicians</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Online & Ready</div>
                </div>
              </div>

              {/* Floating Badge 2: Digital Prescription (Right) */}
              <div className="absolute top-28 right-4 z-20 p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-teal-500/40 shadow-xl flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-100 text-[11px]">Instant Prescription</div>
                  <div className="text-[10px] text-teal-300">Digital & Valid</div>
                </div>
              </div>

              {/* Floating Badge 3: Video Session Active (Bottom Card) */}
              <div className="absolute bottom-4 left-4 right-4 z-20 p-3.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-700/80 shadow-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">Dr. Sarah Jenkins</div>
                    <div className="text-[11px] text-teal-400">Cardiologist • Available Now</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Fee</div>
                  <div className="font-mono font-extrabold text-sm text-emerald-300">
                    ৳ 1,200
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

