'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  PhoneCall,
  Mail,
  MapPin,
  ShieldCheck,
  Heart,
  Lock,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs select-none">
      {/* Top Banner with Emergency Notice */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Emergency medical situations? Dial <strong>911</strong> or visit your nearest hospital immediately.</span>
          </div>

          <div className="flex items-center gap-2 font-mono font-bold text-teal-400">
            <PhoneCall className="w-4 h-4" />
            <span>24/7 Helpline: +880 9612-DOCTOR</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                CityDoctor
              </span>
            </Link>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CityDoctor is Bangladesh&apos;s premier telehealth platform, connecting patients with BMDC-certified physicians 24/7 via instant encrypted video calls.
            </p>

            {/* Payment Partners & Security Badges */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Supported Payment Methods & Security:
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {/* bKash Badge */}
                <div className="px-2.5 py-1 rounded-lg bg-[#e2136e]/20 border border-[#e2136e]/40 text-[#e2136e] font-black text-xs">
                  bKash
                </div>
                {/* Card Badges */}
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs">
                  VISA
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-bold text-xs">
                  Mastercard
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 font-semibold text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>256-Bit SSL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase text-xs tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/" className="hover:text-teal-300 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  All Specialties
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-300 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/admin" className="hover:text-teal-300 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
              <li>
                <Link href="/admin/doctors" className="hover:text-teal-300 transition-colors">
                  Doctor Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Specialties */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase text-xs tracking-wider">
              Specialties
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  General Medicine
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  Gynecology & Pregnancy
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  Pediatrics & Child Care
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  Dermatology & Skin
                </a>
              </li>
              <li>
                <a href="#specialties" className="hover:text-teal-300 transition-colors">
                  Cardiology & Heart
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Office */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 uppercase text-xs tracking-wider">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Gulshan-2, Dhaka 1212, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@citydoctor.com.bd</span>
              </li>
              <li className="flex items-center gap-2 font-mono">
                <PhoneCall className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+880 9612-362867</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} CityDoctor Telehealth Ltd. All rights reserved. DocTime inspiration.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300">HIPAA Compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

