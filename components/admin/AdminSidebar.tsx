'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  FlaskConical,
  HeartPulse,
  LogOut,
  MessageSquareQuote,
  LayoutGrid,
  Bandage,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);

  // Destroy the admin session/cookies, clear local state and leave the panel.
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Session is destroyed client-side regardless of network result.
    } finally {
      try {
        window.localStorage.removeItem('citydoctor_admin_user');
        window.localStorage.removeItem('citydoctor_patient_user');
      } catch {
        // Ignore localStorage access errors.
      }
      router.push('/doctor/login');
      router.refresh();
    }
  };

  React.useEffect(() => {
    const saved = window.localStorage.getItem('cd-admin-sidebar');
    if (saved) setCollapsed(saved === '1');
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      window.localStorage.setItem('cd-admin-sidebar', c ? '0' : '1');
      return !c;
    });
  };

  const navItems = [
    { name: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard, active: pathname === '/admin' },
    { name: 'Manage Doctors', href: '/admin/doctors', icon: Stethoscope, active: pathname === '/admin/doctors' },
    { name: 'Patients', href: '/admin/patients', icon: Users, active: pathname === '/admin/patients' },
    { name: 'Appointments', href: '/admin/appointments', icon: CalendarCheck, active: pathname === '/admin/appointments' },
    { name: 'Hero Banners', href: '/admin/banners', icon: ImageIcon, active: pathname === '/admin/banners' },
    { name: 'Patient Reviews', href: '/admin/reviews', icon: MessageSquareQuote, active: pathname === '/admin/reviews' },
    { name: 'Departments CMS', href: '/admin/departments', icon: LayoutGrid, active: pathname === '/admin/departments' },
    { name: 'Symptoms CMS', href: '/admin/symptoms', icon: Bandage, active: pathname === '/admin/symptoms' },
    { name: 'Security Settings', href: '/admin/settings', icon: KeyRound, active: pathname === '/admin/settings' },
  ];

  // E-commerce / health catalogue CMS (dynamic Medicine Shop, Lab Tests & Plans).
  const catalogueItems = [
    { name: 'Medicine CMS', href: '/admin/medicines', icon: Pill, active: pathname === '/admin/medicines' },
    { name: 'Lab Test Packages', href: '/admin/lab-tests', icon: FlaskConical, active: pathname === '/admin/lab-tests' },
    { name: 'Health Plans', href: '/admin/health-plans', icon: HeartPulse, active: pathname === '/admin/health-plans' },
  ];

  const renderNavLink = (item: { name: string; href: string; icon: any; active: boolean }) => {
    const Icon = item.icon;
    const isActive = item.active;
    return (
      <Link
        key={item.href}
        href={item.href}
        title={item.name}
        className={`relative flex items-center gap-3 rounded-xl text-xs font-semibold transition-all ${
          collapsed ? 'justify-center px-0 py-3' : 'px-3.5 py-2.5'
        } ${
          isActive
            ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
        }`}
      >
        {isActive && !collapsed && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-teal-400" />
        )}
        <Icon
          className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`}
        />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`relative flex flex-col h-full shrink-0 select-none bg-slate-900/80 border-r border-slate-800 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[88px]' : 'w-72'
      }`}
    >
      {/* Collapse toggle floating on the border */}
      <button
        type="button"
        onClick={toggleCollapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-20 z-30 w-6 h-6 rounded-full bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-colors"
      >
        {collapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
      </button>

      {/* Brand */}
      <div
        className={`flex items-center border-b border-slate-800 transition-all ${
          collapsed ? 'justify-center p-3.5' : 'justify-between p-5'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-600/25 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                <span>CityDoctor Admin</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">Control Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Management
          </div>
        )}
        {navItems.map((item) => renderNavLink(item))}

        {/* Marketplace CMS — Medicine Shop, Lab Tests & Health Plans */}
        {collapsed ? (
          <div className="pt-3 flex justify-center">
            <Pill className="w-4 h-4 text-slate-500" />
          </div>
        ) : (
          <div className="pt-3 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Marketplace CMS
          </div>
        )}
        {catalogueItems.map((item) => renderNavLink(item))}

        {collapsed ? (
          <div className="pt-4 flex justify-center">
            <ShieldCheck className="w-4 h-4 text-teal-400/80" />
          </div>
        ) : (
          <>
            <div className="pt-4 px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Platform Security
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-teal-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>BMDC &amp; HIPAA Compliant</span>
              </div>
              <p className="text-[10px] text-slate-500">Database: SQLite &amp; Prisma ORM</p>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        {collapsed ? (
          <>
            <Link
              href="/doctor/login"
              title="Doctor Portal Login"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              title="Back to Patient Portal"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout / Sign Out"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Link
              href="/doctor/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 hover:text-teal-200 text-xs font-semibold border border-teal-500/30 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctor Portal Login</span>
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Back to Patient Portal</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold border border-red-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout / Sign Out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

