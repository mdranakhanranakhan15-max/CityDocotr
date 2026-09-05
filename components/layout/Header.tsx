'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ShieldCheck,
  PhoneCall,
  Bell,
  Video,
  User,
  UserCheck,
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onlineCount?: number;
  isCallActive?: boolean;
  activeDoctorName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onlineCount = 0,
  isCallActive = false,
  activeDoctorName,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { currentUser, openAuthModal, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 ring-1 ring-teal-400/30 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                DocTime
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                Telehealth
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Instant Doctor Consultation & AI Triage
            </p>
          </div>
        </Link>
      </div>

      {/* Middle Status Badge */}
      <div className="hidden md:flex items-center gap-4">
        {isCallActive ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-red-300">
              Live Session with {activeDoctorName || 'Doctor'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-medium text-emerald-300">
              {onlineCount > 0 ? `${onlineCount} Doctors Ready for Video Call` : 'Physicians Available'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-400 border-l border-slate-800 pl-4">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>E2E Encrypted & SQLite Database</span>
        </div>
      </div>

      {/* Right Actions: Emergency, Admin Switch & Profile */}
      <div className="flex items-center gap-3">
        {/* Emergency Notice */}
        <a
          href="tel:911"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 border border-red-800/40 text-red-300 text-xs font-semibold transition-all hover:scale-105"
          title="Emergency Dial 911"
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-bounce" />
          <span>Emergency: 911</span>
        </a>

        {/* Link to Admin Panel */}
        <Link
          href="/admin"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-colors"
          title="Switch to Admin Control Panel"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden sm:inline">Admin Panel</span>
        </Link>

        {/* User Auth State: Login / Sign Up or Profile Dropdown */}
        {currentUser ? (
          <div className="relative flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl hover:bg-slate-800 py-1 pl-1 pr-2 transition-colors"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center font-bold text-sm text-slate-950 shadow-md shrink-0">
                {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200 max-w-[140px] truncate">
                  {currentUser.name}
                </div>
                <div className="text-[11px] text-teal-400 font-medium truncate max-w-[140px]">
                  {currentUser.phone || 'Patient'}
                </div>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                  profileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {profileMenuOpen && (
              <>
                {/* Click-away layer */}
                <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+8px)] w-56 z-20 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 p-2 space-y-1 animate-in zoom-in-95 fade-in duration-150 origin-top-right"
                >
                  <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Patient Account
                  </p>
                  <Link
                    href="/patient/appointments"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-teal-500/10 hover:text-teal-300 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4 text-teal-400" />
                    My Appointments
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => openAuthModal({ redirectTo: '/patient/appointments' })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-xs font-bold transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Login / Sign Up</span>
          </button>
        )}
      </div>
    </header>
  );
};
