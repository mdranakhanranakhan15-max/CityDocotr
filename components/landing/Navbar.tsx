'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  PhoneCall,
  LayoutDashboard,
  Menu,
  X,
  User,
  LogOut,
  CalendarDays,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { currentUser, openAuthModal, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl transition-all select-none">
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 h-24 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-500 flex items-center justify-center shadow-xl shadow-teal-500/25 ring-2 ring-teal-400/30 group-hover:scale-105 transition-all duration-300">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-teal-300 via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                CityDoctor
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 shadow-sm">
                DocTime
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Online Telehealth &amp; 24/7 Doctor Consultation
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <Link
            href="/"
            className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
          >
            <span>Home</span>
          </Link>
          <a
            href="#specialties"
            className="hover:text-teal-300 transition-colors"
          >
            Specialties
          </a>
          <a
            href="#doctors"
            className="hover:text-teal-300 transition-colors"
          >
            Doctors
          </a>
          <a
            href="#how-it-works"
            className="hover:text-teal-300 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#contact"
            className="hover:text-teal-300 transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3.5">
          {/* 24/7 Hotline */}
          <a
            href="tel:+8809612345678"
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
            <span>24/7 Hotline</span>
          </a>

          {/* Admin Control Link */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-xs font-semibold text-slate-300 hover:text-teal-300 transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
            <span>Admin</span>
          </Link>

          {/* User Auth State / Button */}
          {currentUser ? (
            <div className="relative flex items-center gap-3 pl-2 border-l border-slate-800">
              {/* Profile trigger — toggles the user dropdown */}
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 rounded-xl hover:bg-slate-900 py-1.5 pl-1 pr-2.5 transition-colors"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
              >
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-teal-500/20">
                  {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-slate-200 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-teal-400 font-medium mt-0.5">
                    {currentUser.phone}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {profileMenuOpen && (
                <>
                  {/* Click-away layer */}
                  <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-56 z-20 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-black/40 p-2 space-y-1 animate-in zoom-in-95 fade-in duration-150 origin-top-right"
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
              onClick={() => openAuthModal({ redirectTo: '/' })}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 hover:border-teal-500/40 transition-all flex items-center gap-2"
            >
              <User className="w-4 h-4 text-teal-400" />
              <span>Login / Sign Up</span>
            </button>
          )}

          {/* Consult Doctor CTA */}
          <button
            onClick={() => {
              const docSection = document.getElementById('doctors');
              docSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Doctor</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white lg:hidden"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 p-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
          {currentUser && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-slate-950 font-black text-base flex items-center justify-center">
                  {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">{currentUser.name}</p>
                  <p className="text-xs text-teal-400">{currentUser.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/patient/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 text-xs font-bold border border-teal-500/20 flex items-center gap-1.5"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  My Appointments
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-bold border border-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-teal-400 hover:text-teal-300 py-1"
            >
              Home
            </Link>
            <a
              href="#specialties"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-teal-300 py-1"
            >
              Specialties
            </a>
            <a
              href="#doctors"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-teal-300 py-1"
            >
              Doctors
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-teal-300 py-1"
            >
              How It Works
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-teal-300 py-1"
            >
              Contact
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
            {!currentUser && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal({ redirectTo: '/' });
                }}
                className="w-full py-3 rounded-xl bg-slate-900 border border-slate-700 text-center text-xs font-bold text-slate-100 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-teal-400" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs font-semibold text-slate-300 flex items-center justify-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <span>Admin Dashboard</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const docSection = document.getElementById('doctors');
                docSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 text-center"
            >
              Consult a Doctor Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


