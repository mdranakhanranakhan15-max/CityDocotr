'use client';

import React from 'react';
import {
  Search,
  CreditCard,
  Video,
  FileText,
  Sparkles,
  Bot,
  ArrowRight,
} from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose a Doctor or Specialty',
      description:
        'Browse our verified physician directory or search by symptom. View ratings, qualifications, and consultation fees.',
      icon: Search,
      color: 'teal',
    },
    {
      step: '02',
      title: 'Easy Checkout via bKash or Card',
      description:
        'Pay consultation fees instantly with bKash or Visa/Mastercard credit and debit cards over 256-bit SSL.',
      icon: CreditCard,
      color: 'pink',
    },
    {
      step: '03',
      title: 'Live Video Call & AI Voice Assistant',
      description:
        'Connect face-to-face in high definition with your doctor. Talk with Dr. Aria AI for real-time symptom triage.',
      icon: Video,
      color: 'cyan',
    },
    {
      step: '04',
      title: 'Instant Digital Prescription',
      description:
        'Receive your official signed digital prescription immediately after the consultation, valid at any pharmacy.',
      icon: FileText,
      color: 'emerald',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-slate-950 border-t border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
            How CityDoctor Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Get expert medical consultation from the comfort of your home in four straightforward steps.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 shadow-xl transition-all duration-300 relative group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Step Number Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono font-black text-2xl text-slate-700 group-hover:text-teal-400/50 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-100 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

