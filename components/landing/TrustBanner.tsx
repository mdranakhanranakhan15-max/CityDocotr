'use client';

import React from 'react';
import {
  Users,
  Video,
  FileCheck,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

export const TrustBanner: React.FC = () => {
  const stats = [
    {
      icon: Users,
      value: '100+ Verified Doctors',
      description: 'Specialists across 25+ medical departments',
      color: 'teal',
    },
    {
      icon: Video,
      value: 'Instant Video Consult',
      description: 'Connect with a doctor in under 2 minutes',
      color: 'cyan',
    },
    {
      icon: FileCheck,
      value: 'Digital Prescriptions',
      description: 'Valid, downloadable & sent instantly to email',
      color: 'emerald',
    },
    {
      icon: CreditCard,
      value: 'bKash & Card Payment',
      description: '100% secure encrypted payment checkout',
      color: 'amber',
    },
  ];

  return (
    <section className="py-8 bg-slate-900/90 border-b border-slate-800/80 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 hover:border-teal-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-extrabold text-sm text-slate-100 group-hover:text-teal-300 transition-colors">
                    {item.value}
                  </h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

