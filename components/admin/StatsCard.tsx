'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'teal' | 'blue' | 'emerald' | 'amber' | 'rose';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'teal',
}) => {
  const colorMap = {
    teal: 'from-teal-500/20 to-teal-500/5 text-teal-400 border-teal-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30',
  };

  const iconBgMap = {
    teal: 'bg-teal-500/20 text-teal-300 ring-teal-400/20',
    blue: 'bg-blue-500/20 text-blue-300 ring-blue-400/20',
    emerald: 'bg-emerald-500/20 text-emerald-300 ring-emerald-400/20',
    amber: 'bg-amber-500/20 text-amber-300 ring-amber-400/20',
    rose: 'bg-rose-500/20 text-rose-300 ring-rose-400/20',
  };

  return (
    <div
      className={`p-5 rounded-2xl bg-gradient-to-br ${colorMap[color]} bg-slate-900/90 border shadow-lg relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1 font-mono">
            {value}
          </div>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ring-1 shadow-inner ${iconBgMap[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && <span className="text-emerald-400 font-semibold">{trend}</span>}
        </div>
      )}
    </div>
  );
};

