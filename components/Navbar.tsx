'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Phone,
  ShieldCheck,
  Smartphone,
  Menu,
  X,
  User,
  LayoutDashboard,
  LogOut,
  CalendarDays,
  BadgeCheck,
  Video,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  /** Triggered by the "Consult in 10 Mins" CTA + mobile "Consult Now" button. */
  onConsultClick?: () => void;
}

const NAV_LINKS = [
  { label: 'Find Doctors', href: '/department/all' },
  { label: 'Specialties', href: '#specialties' },
  { label: 'Medicine Delivery', href: '#medicine' },
  { label: 'Lab Tests', href: '#diagnostic' },
  { label: 'Health Plans', href: '#health-plans' },
  { label: 'My Consults & Rx', href: '/patient/appointments' },
];

// Hash-anchored section ids (rendered on the home page) used by the scroll spy
// so the pill navigation highlights whichever landing section is in view.
const SECTION_IDS = NAV_LINKS.filter((l) => l.href.startsWith('#')).map((l) =>
  l.href.slice(1)
);

/**
 * DocTime design navbar — navy utility top-bar with hotline / BMDC trust line,
 * then a crisp white navigation row with blue-600 accents, pill CTA and a
 * slide-down mobile drawer.
 */
export default function Navbar({ onConsultClick }: NavbarProps = {}) {
  const { currentUser, openAuthModal, logout } = useAuth();
  const { itemCount: cartItemCount, openCart } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  // Scroll spy for home-page hash links so the active nav link follows the
  // section currently in view (only meaningful on "/" where they exist).
  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }
    const onScroll = () => {
      const offset = 150; // fixed header height + breathing room
      let current = '';
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      const lastEl = document.getElementById(SECTION_IDS[SECTION_IDS.length - 1]);
      if (
        lastEl &&
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 80
      ) {
        current = SECTION_IDS[SECTION_IDS.length - 1];
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const isNavLinkActive = (href: string) => {
    if (href.startsWith('#')) {
      return pathname === '/' && activeSection === href.slice(1);
    }
    if (href === '/department/all') return pathname.startsWith('/department');
    return pathname === href || pathname.startsWith(href);
  };

  const navBaseCls =
    'whitespace-nowrap text-[13px] rounded-full px-3 py-1.5 transition-all';
  const navActiveCls =
    'text-blue-600 font-semibold bg-blue-50/80 shadow-sm';
  const navIdleCls =
    'text-slate-600 font-semibold hover:text-blue-600 hover:bg-blue-50/80';


  const consultClick =
    onConsultClick ||
    (() => {
      const section = document.getElementById('doctors');
      section?.scrollIntoView({ behavior: 'smooth' });
    });

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full select-none">
      {/* ============ UTILITY TOP BAR ============ */}
      <div className="hidden lg:block bg-[#0b1f4b] text-blue-100/90 text-[12px] font-medium">
        <div className="max-w-[1440px] mx-auto px-6 h-9 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <a
              href="tel:+8809612345678"
              className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-blue-200/70 font-semibold mr-0.5">•</span>
              <span className="truncate">24/7 Telemedicine Hotline: 09612-345678</span>
            </a>
            <span className="hidden xl:flex items-center gap-1.5 text-blue-200/80">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              BMDC Certified Doctors Only
            </span>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            <span className="flex items-center gap-1 text-blue-200/80">
              <span className="text-blue-300">৳</span> BDT
            </span>
            <button
              type="button"
              onClick={() =>
                document.getElementById('app')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="flex items-center gap-1.5 text-blue-100 hover:text-white transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-300" />
              Get Mobile App
            </button>
          </div>
        </div>
      </div>

      {/* ============ MAIN NAV ROW ============ */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200/70 shadow-[0_1px_10px_rgba(2,6,23,0.04)]">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 focus:outline-none group">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:shadow-lg transition-all">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none text-left">
              <span className="text-[17px] lg:text-[19px] font-extrabold text-slate-900 tracking-tight">
                City<span className="text-blue-600">Doctor</span>
                <span className="ml-1.5 align-middle text-[8px] lg:text-[9px] font-bold tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-[3px] rounded-md uppercase">
                  Plus
                </span>
              </span>
              <span className="text-[10px] lg:text-[10.5px] text-slate-400 font-semibold mt-1">
                Healthcare in 10 Minutes
              </span>
            </div>
          </Link>

          {/* Desktop nav links — single row, inline between logo & actions */}
          <nav className="hidden xl:flex items-center gap-0.5 min-w-0 justify-center">
            {NAV_LINKS.map((link) => {
              const isActive = isNavLinkActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`${navBaseCls} ${isActive ? navActiveCls : navIdleCls}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Medicine cart (opens the global CartDrawer) */}
            <button
              type="button"
              onClick={openCart}
              className="relative p-2.5 rounded-full text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label={`Open cart, ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}`}
            >
              <ShoppingCart className="w-[22px] h-[22px]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-red-500/30 border-2 border-white">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* Consult CTA (desktop) */}
            <button
              type="button"
              onClick={consultClick}
              className="hidden md:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-bold pl-4 pr-2.5 py-2 rounded-full transition-all shadow-md shadow-blue-600/25 active:scale-[0.97]"
            >
              <span>Consult in 10 Mins</span>
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <div className="w-px h-7 bg-slate-200 hidden sm:block" />

            {/* Profile / login */}
            {currentUser ? (
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-50 transition-colors focus:outline-none"
                  aria-label="Open account menu"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center ring-2 ring-blue-100">
                    {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <span className="hidden 2xl:inline-block text-[13px] text-slate-700 font-semibold max-w-[130px] truncate">
                    {currentUser.name}
                  </span>
                </button>

                {profileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                    <div
                      role="menu"
                      className="absolute right-[-20px] top-[calc(100%+10px)] w-64 z-20 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-2 space-y-1 origin-top-right"
                    >
                      <div className="px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 mb-1">
                        <p className="text-[13.5px] font-bold text-slate-900 truncate">{currentUser.name}</p>
                        <p className="text-[11.5px] text-blue-600 font-medium">{currentUser.phone}</p>
                      </div>
                      <Link
                        href="/patient/appointments"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        My Appointments
                      </Link>
                      <Link
                        href="/patient/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <BadgeCheck className="w-4 h-4 text-blue-600" />
                        Account Settings
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
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
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-[13px] font-bold transition-colors 2xl:px-4"
              >
                <User className="w-4 h-4" />
                <span className="hidden 2xl:inline">Login / Sign Up</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-100 shadow-xl p-4 space-y-3 max-h-[calc(100vh-64px)] overflow-y-auto">
            {currentUser && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                    {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-xs text-blue-600">{currentUser.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-bold border border-red-100"
                >
                  Sign Out
                </button>
              </div>
            )}

            <nav className="grid grid-cols-2 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl bg-slate-50 text-slate-700 text-[13px] font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between gap-1"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                </Link>
              ))}
            </nav>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              {!currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal({ redirectTo: '/patient/appointments' });
                  }}
                  className="w-full py-3 rounded-xl bg-blue-50 text-blue-700 text-[13px] font-bold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Login / Sign Up
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  consultClick();
                }}
                className="w-full py-3 rounded-full bg-blue-600 text-white text-[13.5px] font-bold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                Consult in 10 Mins
              </button>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-600 text-[12.5px] font-semibold flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

