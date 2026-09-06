'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  Settings,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Video,
} from 'lucide-react';

interface DoctorSidebarProps {
  doctorName?: string;
  doctorImage?: string | null;
  specialty?: string;
}

export const DoctorSidebar: React.FC<DoctorSidebarProps> = ({
  doctorName,
  doctorImage,
  specialty,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem('cd-doctor-sidebar');
    if (saved) setCollapsed(saved === '1');
  }, []);

  useEffect(() => {
    if (!doctorName) {
      fetch('/api/doctor/me')
        .then((r) => r.json())
        .then((d) => setProfile(d?.authenticated ? d.doctor : null))
        .catch(() => setProfile(null));
    }
  }, [doctorName]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      window.localStorage.setItem('cd-doctor-sidebar', c ? '0' : '1');
      return !c;
    });
  };

  const handleLogout = async () => {
    await fetch('/api/doctor/logout', { method: 'POST' });
    router.replace('/doctor/login');
  };

  const name = doctorName || profile?.name || 'Doctor';
  const image = doctorImage || profile?.image || null;
  const spec = specialty || profile?.specialty || '';

  const navItems = [
    {
      name: 'Dashboard',
      href: '/doctor/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/doctor/dashboard',
    },
    {
      name: 'Security Settings',
      href: '/doctor/settings',
      icon: Settings,
      active: pathname === '/doctor/settings',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col h-screen shrink-0 select-none bg-slate-950/95 border-r border-slate-800 backdrop-blur-xl transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[74px]' : 'w-60'
      }`}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-20 z-30 w-6 h-6 rounded-full bg-slate-800 hover:bg-teal-600 text-slate-300 hover:text-white border border-slate-700 shadow-lg flex items-center justify-center transition-colors"
      >
        {collapsed ? (
          <PanelLeftOpen className="w-3.5 h-3.5" />
        ) : (
          <PanelLeftClose className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Brand */}
      <div
        className={`flex items-center border-b border-slate-800 transition-all ${
          collapsed ? 'justify-center p-3.5' : 'justify-between p-5'
        }`}
      >
        <Link href="/doctor/dashboard" className="flex items-center gap-2.5 min-w-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/25 shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-100 truncate">
                CityDoctor <span className="text-teal-400">Doctor</span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">Doctor Portal</p>
            </div>
          )}
        </Link>
      </div>

      {/* Doctor profile mini-card */}
      <div
        className={`border-b border-slate-800 ${
          collapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4 flex items-center gap-3'
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name}
            className="w-11 h-11 rounded-2xl object-cover border-2 border-teal-500/40 shrink-0"
          />
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 text-teal-300 font-black flex items-center justify-center shrink-0">
            {(name || 'D').charAt(0)}
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-100 truncate">{name}</div>
            {spec && <div className="text-[10px] text-teal-400 truncate">{spec}</div>}
            <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Practicing now
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {!collapsed && (
          <div className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Portal
          </div>
        )}
        {navItems.map((item) => {
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
        })}

        {!collapsed && (
          <div className="pt-4 px-3.5">
            <div className="rounded-2xl bg-slate-900/60 border border-teal-500/20 p-3 text-[10px] text-slate-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                <ShieldCheck className="w-3 h-3" /> Strict data isolation
              </div>
              <p>All records are scoped to your signed doctor session.</p>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 space-y-2">
        {collapsed ? (
          <>
            <Link
              href="/"
              title="Open patient portal"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-teal-400" />
              <span>Telehealth live</span>
            </div>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Patient Portal</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

