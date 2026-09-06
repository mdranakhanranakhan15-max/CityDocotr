'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import DoctorCard from '@/components/DoctorCard';
import BookingModal from '@/components/BookingModal';
import {
  Activity,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  Loader2,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

function CategoryPage({ params }: CategoryPageProps) {
  const rawCategory = params?.category || 'all';

  // Format category slug to human-readable title
  const formattedCategory = useMemo(() => {
    if (!rawCategory || rawCategory === 'all') return 'All Specialties';
    return rawCategory
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [rawCategory]);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [onlineOnlyFilter, setOnlineOnlyFilter] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [maxFeeFilter, setMaxFeeFilter] = useState<number>(1000);

  // Selected Doctor for Time Slot Booking
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser, openAuthModal, logout } = useAuth();

  // Fetch doctors by category from API
  useEffect(() => {
    let isMounted = true;
    async function fetchDoctors() {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams();
        if (rawCategory && rawCategory !== 'all') {
          searchParams.set('category', rawCategory);
        }
        if (sortBy) {
          searchParams.set('sortBy', sortBy);
        }

        const res = await fetch(`/api/doctors?${searchParams.toString()}`);
        const data = await res.json();
        if (isMounted && data.success && data.doctors) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error('Error fetching doctors for department:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchDoctors();
    return () => {
      isMounted = false;
    };
  }, [rawCategory, sortBy]);

  // Lightweight polling so a doctor's Online/Offline portal toggle is reflected
  // on the public directory (the blue "online" status dot / badge) without a
  // manual page refresh.
  useEffect(() => {
    let cancelled = false;
    async function pollDoctors() {
      try {
        const searchParams = new URLSearchParams();
        if (rawCategory && rawCategory !== 'all') {
          searchParams.set('category', rawCategory);
        }
        if (sortBy) {
          searchParams.set('sortBy', sortBy);
        }
        const res = await fetch(`/api/doctors?${searchParams.toString()}`);
        const data = await res.json();
        if (!cancelled && data.success && data.doctors) {
          setDoctors(data.doctors);
        }
      } catch (err) {
        console.error('Error polling doctors for online status:', err);
      }
    }
    const id = setInterval(pollDoctors, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [rawCategory, sortBy]);

  // Filtered doctors based on client-side search & quick toggles
  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesSearch =
        !searchQuery ||
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialties?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.workplace?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospital?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.degrees?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesOnline = !onlineOnlyFilter || doc.isOnline === true;
      const matchesFee = (doc.fee || doc.consultationFee || 350) <= maxFeeFilter;

      return matchesSearch && matchesOnline && matchesFee;
    });
  }, [doctors, searchQuery, onlineOnlyFilter, maxFeeFilter]);

  const handleBookClick = (doc: any) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#f8fbff] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-blue-800">
                City<span className="text-blue-600">Doctor</span>
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Home
            </Link>
            <Link href="/#choose-specialty" className="text-blue-700 font-bold hover:text-blue-800 transition-colors">
              Departments
            </Link>
            <Link href="/#diagnostic" className="hover:text-blue-700 transition-colors">
              Home Diagnostic
            </Link>
            <Link href="/#health-plan" className="hover:text-blue-700 transition-colors">
              Health Plan
            </Link>
          </nav>

          <div className="flex items-center gap-3.5">
            <Link
              href="/admin/doctors"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors hidden sm:inline-block"
            >
              Admin Panel
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-700 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-700/20">
                    {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[130px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                      {currentUser.phone}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal({ redirectTo: '/patient/appointments' })}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2 border border-slate-200"
              >
                <User className="w-4 h-4 text-blue-700" />
                <span>Login / Sign Up</span>
              </button>
            )}

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. BREADCRUMBS & DYNAMIC HEADER */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-4">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/#choose-specialty" className="hover:text-blue-700 transition-colors">Specialties</Link>
            <span>/</span>
            <span className="text-blue-700 font-bold">{formattedCategory}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Find the Best {formattedCategory} in Bangladesh
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Consult with verified {formattedCategory} specialists online anytime via instant encrypted HD video call.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
              <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {filteredDoctors.length} Doctors Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SEARCH BAR, FILTER BUTTON & SORT DROPDOWN */}
      <section className="py-4 px-4 sm:px-6 lg:px-8 bg-[#f0f7ff] border-b border-blue-100 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
            <input
              type="text"
              placeholder={`Search ${formattedCategory} by name, hospital, degrees...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-white border border-blue-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setOnlineOnlyFilter(!onlineOnlyFilter)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                onlineOnlyFilter
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  onlineOnlyFilter ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <span>Online Now</span>
            </button>

            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-400 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              <span>Filter</span>
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer"
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="visits">Most Visits</option>
                <option value="fee_asc">Fee: Low to High</option>
                <option value="fee_desc">Fee: High to Low</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {showFilterModal && (
          <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 mt-3 p-4 bg-white rounded-2xl border border-blue-200 shadow-sm animate-in fade-in space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
              <span>Filter by Consultation Fee</span>
              <span className="text-blue-700 font-mono">Up to ৳{maxFeeFilter}</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="200"
                max="1000"
                step="50"
                value={maxFeeFilter}
                onChange={(e) => setMaxFeeFilter(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <button
                onClick={() => {
                  setMaxFeeFilter(1000);
                  setOnlineOnlyFilter(false);
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. DOCTOR LISTING 3-COLUMN GRID & INLINE DOCTOR CARDS */}
      <main className="flex-1 w-full px-4 md:px-8 xl:px-12 py-8 sm:py-12 select-none">
        {isLoading ? (
          <div className="p-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              Fetching verified {formattedCategory} specialists...
            </p>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doc) => (
              <DoctorCard
                key={doc.id}
                doctor={doc}
                onBookClick={() => handleBookClick(doc)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">
              No doctors found for category &ldquo;{rawCategory}&rdquo;
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, increasing the maximum fee limit, or viewing all verified physicians.
            </p>
            <Link
              href="/department/all"
              className="inline-block px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20"
            >
              Browse All Doctors
            </Link>
          </div>
        )}
      </main>
      {/* 7. FOOTER */}
      <footer className="bg-blue-600 text-white text-xs select-none mt-auto">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white text-blue-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base">CityDoctor</span>
          </div>
          <p className="text-blue-100 text-center sm:text-left">
            Connecting patients across Bangladesh with BMDC-verified physicians 24/7.
          </p>
          <div className="text-blue-100">
            Emergency Helpline: <strong className="text-white">+880 9612-362867</strong>
          </div>
        </div>
        <div className="bg-white text-slate-600 py-3 text-center border-t border-slate-200 text-xs font-semibold">
          Copyright © 2026 CityDoctor. All rights reserved.
        </div>
      </footer>

      {/* 8. TIME SLOT BOOKING MODAL */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctor={selectedDoctor}
      />
    </div>
  );
}

export default CategoryPage;
