'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Activity,
  ArrowLeft,
  ShieldCheck,
  ImageIcon,
  Stethoscope,
  KeyRound,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Overview Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      name: 'Manage Doctors',
      href: '/admin/doctors',
      icon: Stethoscope,
      active: pathname === '/admin/doctors',
    },
    {
      name: 'Patients',
      href: '/admin/patients',
      icon: Users,
      active: pathname === '/admin/patients',
    },
    {
      name: 'Appointments',
      href: '/admin/appointments',
      icon: CalendarCheck,
      active: pathname === '/admin/appointments',
    },
    {
      name: 'Hero Banners',
      href: '/admin/banners',
      icon: ImageIcon,
      active: pathname === '/admin/banners',
    },
    {
      name: 'Security Settings',
      href: '/admin/settings',
      icon: KeyRound,
      active: pathname === '/admin/settings',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-600/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>CityDoctor Admin</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                item.active
                  ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${item.active ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Platform Security
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BMDC & HIPAA Compliant</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Database: SQLite & Prisma ORM
          </p>
        </div>
      </nav>

      {/* Footer Navigation Back to Patient Portal */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        <Link
          href="/doctor/login"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 text-xs font-semibold border border-teal-500/30 transition-colors"
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor Portal Login</span>
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Back to Patient Portal</span>
        </Link>
      </div>
    </aside>
  );
};
