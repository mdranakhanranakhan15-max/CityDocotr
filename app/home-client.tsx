'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Activity,
  Search,
  Gift,
  ShieldCheck,
  Star,
  Users,
  Video,
  Clock,
  CheckCircle2,
  PhoneCall,
  ChevronDown,
  ArrowRight,
  TestTube,
  Building,
  Laptop,
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Smile,
  Sparkles,
  Zap,
  FileCheck,
  User,
  Menu,
  X,
  CreditCard,
  FileText,
  HeartPulse,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CalendarDays,
  Loader2,
  Settings,
  LayoutDashboard,
  Lock,
  Smartphone,
  QrCode,
  Download,
  Plus,
  Minus,
  Mail,
  MapPin,
  Send,
  HelpCircle,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Check,
  Layers,
  Thermometer,
  Eye,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PaymentCheckoutModal } from '@/components/payment/PaymentCheckoutModal';

interface HeroBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  isActive: boolean;
}

export default function CityDoctorLandingPage() {
  const router = useRouter();
  const { currentUser, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorForPayment, setSelectedDoctorForPayment] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Dynamic Hero Banners State
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);

  // Choose Department vs Symptom Toggle State
  const [activeTab, setActiveTab] = useState<'departments' | 'symptoms'>('departments');

  // Testimonial Carousel State
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // FAQ Accordion State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    concern: 'Doctor Consultation',
    query: '',
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Fetch doctors and active hero banners
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [docRes, banRes] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/banners'),
        ]);

        const docData = await docRes.json();
        if (docData.success && docData.doctors) {
          setDoctors(docData.doctors);
        }

        const banData = await banRes.json();
        if (banData.success && banData.banners && banData.banners.length > 0) {
          setBanners(banData.banners);
        } else {
          setBanners([
            {
              id: 'banner-1',
              title: '1800+ Specialist And Experienced Doctors From Reputed Hospitals',
              subtitle: 'Get instant online video consultations anytime, anywhere with BMDC certified physicians.',
              imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
              isActive: true,
            },
            {
              id: 'banner-2',
              title: 'Doorstep Diagnostic Lab Tests & Health Checks in 24 Hours',
              subtitle: 'Certified phlebotomists collect blood samples at home with vacuum sterile tubes.',
              imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
              isActive: true,
            },
            {
              id: 'banner-3',
              title: '24/7 Urgent Telehealth & AI Clinical Symptom Triage',
              subtitle: 'Connect with a verified physician in under 2 minutes for immediate treatment plans.',
              imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
              isActive: true,
            },
          ]);
        }
      } catch (e) {
        console.error('Error fetching initial data:', e);
      }
    }
    fetchInitialData();
  }, []);

  // Auto-play hero slider
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const handlePrevBanner = () => {
    setActiveBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % banners.length);
  };

  const handleOpenConsultation = (doctor?: any) => {
    if (doctor) {
      setSelectedDoctorForPayment(doctor);
    } else if (doctors.length > 0) {
      setSelectedDoctorForPayment(doctors[0]);
    }
    setIsPaymentModalOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const slug = searchQuery.trim().toLowerCase().replace(/\s+/g, '-');
      router.push(`/department/${slug}`);
    } else {
      router.push('/department/all');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({
        name: '',
        email: '',
        concern: 'Doctor Consultation',
        query: '',
      });
      setContactSubmitted(false);
    }, 4000);
  };

  // Departments List (Routes to /department/[slug])
  const departments = [
    { name: 'General Physician', slug: 'general-physician', sub: 'Primary Care Physician', icon: Stethoscope },
    { name: 'Pediatrics', slug: 'pediatrics', sub: 'Child Specialist', icon: Baby },
    { name: 'Gynae & Obs', slug: 'gynae-obs', sub: "Women's Health Specialist", icon: Sparkles },
    { name: 'Dermatology', slug: 'dermatology', sub: 'Skin & Hair Specialist', icon: Sparkles },
    { name: 'Internal Medicine', slug: 'internal-medicine', sub: 'Adult Health Specialist', icon: Activity },
    { name: 'Endocrinology', slug: 'endocrinology', sub: 'Diabetes & Hormone Care', icon: HeartPulse },
    { name: 'Cardiology', slug: 'cardiology', sub: 'Heart Specialist', icon: Heart },
    { name: 'Neurology', slug: 'neurology', sub: 'Brain & Nerve Specialist', icon: Brain },
    { name: 'Psychiatry', slug: 'psychiatry', sub: 'Mental Wellness & Therapy', icon: Smile },
    { name: 'Orthopedics', slug: 'orthopedics', sub: 'Bone & Joint Surgeon', icon: ShieldCheck },
  ];

  // Symptoms List (Routes to /department/[slug])
  const symptoms = [
    {
      name: 'Fever / Cold / Flu',
      slug: 'general-physician',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Period & Menstrual Problems',
      slug: 'gynae-obs',
      image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Sexual Health Problems',
      slug: 'general-physician',
      image: 'https://images.unsplash.com/photo-1516585427167-9f4af9627e6c?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Child Diseases & Fever',
      slug: 'pediatrics',
      image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Skin Rash & Acne',
      slug: 'dermatology',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Chest Pain & Palpitation',
      slug: 'cardiology',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Back & Joint Pain',
      slug: 'orthopedics',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Stomach Gas & Acid Reflux',
      slug: 'general-physician',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Headache & Migraine',
      slug: 'neurology',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=300',
    },
    {
      name: 'Depression & Anxiety',
      slug: 'psychiatry',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    },
  ];

  // Testimonials list
  const testimonials = [
    {
      name: 'Md. Ashifuzzaman',
      role: 'Verified Patient • Dhaka',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      comment:
        '“CityDoctor made healthcare so convenient for my elderly parents. We connected with an expert cardiologist within 8 minutes and received a digital prescription right after the video call. Outstanding service!”',
    },
    {
      name: 'Nusrat Jahan',
      role: 'Mother of 2 • Chittagong',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      comment:
        '“When my child had late-night fever, I was able to get a pediatrician online in under 2 minutes. The doctor was extremely thorough and gentle. CityDoctor is a lifesaver for families.”',
    },
    {
      name: 'Tanvir Ahmed',
      role: 'Corporate Executive • Sylhet',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      comment:
        '“The bKash payment checkout is lightning fast, and having our lab sample collected right at home saved us half a day of hospital queues. Truly 10/10 medical experience.”',
    },
  ];

  // FAQ Items
  const faqs = [
    {
      q: 'What medical conditions do we treat online?',
      a: 'Our certified physicians treat a wide spectrum of non-emergency health concerns including seasonal viral fever, cough, flu, skin irritations & acne, hypertension, diabetes follow-ups, gastric disorders, mental health counseling, and pediatric questions.',
    },
    {
      q: 'How does the online video consultation work?',
      a: 'Simply select your preferred doctor or specialty, complete the quick checkout with bKash or Card, and enter your private encrypted video room in under 2 minutes. You can speak with the doctor directly, share symptoms, and receive an instant digital prescription.',
    },
    {
      q: 'How do I receive and use my digital prescription?',
      a: 'Immediately after the call concludes, your BMDC-registered doctor generates an official signed digital prescription. It is stored securely in your CityDoctor account and sent to your email & phone via SMS. It is 100% valid at any registered pharmacy.',
    },
    {
      q: 'What payment methods are supported on CityDoctor?',
      a: 'We accept instant mobile payments via bKash as well as all major Visa, Mastercard, and American Express Debit and Credit Cards over 256-bit SSL encryption.',
    },
    {
      q: 'Are all doctors on CityDoctor BMDC certified?',
      a: 'Yes, absolutely. Every single physician on CityDoctor is thoroughly verified with the Bangladesh Medical & Dental Council (BMDC) and holds degrees from recognized medical colleges with extensive clinical hospital experience.',
    },
  ];

  // Health Blogs
  const blogs = [
    {
      title: 'Symptoms of Liver Disease & Early Warning Signs',
      author: 'CityDoctor Health Team',
      time: '5 min read • 2 days ago',
      excerpt: 'Learn how to detect fatty liver and early hepatic changes with routine lifestyle adjustments and blood markers.',
      image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Managing High Blood Pressure Naturally at Home',
      author: 'Dr. Sarah Jenkins (Cardiologist)',
      time: '4 min read • 3 days ago',
      excerpt: 'Key dietary steps, potassium balance, and simple daily habits to control hypertension without stress.',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Pediatric Care: What to Do During Childhood Fevers',
      author: 'Dr. Maya Patel (Pediatrician)',
      time: '6 min read • 1 week ago',
      excerpt: 'Essential dosage guidelines, temperature monitoring, and when to seek urgent specialist care for your child.',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    },
    {
      title: 'Essential Skin Health & Acne Prevention Tips',
      author: 'Dr. Marcus Vance (Dermatologist)',
      time: '3 min read • 1 week ago',
      excerpt: 'Dermatologist-recommended skincare routines, barrier repair, and sun protection in humid climates.',
      image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const currentBanner = banners[activeBannerIdx] || {
    title: '1800+ Specialist And Experienced Doctors From Reputed Hospitals',
    subtitle: 'Get instant online video consultations anytime, anywhere with BMDC certified physicians.',
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
  };

  // Live pulse data for the Bento hero (real-time active indicators)
  const liveOnlineDoctors = doctors.filter(
    (d) => (d.status || '').toUpperCase() === 'ONLINE'
  );
  const pulseDoctors =
    liveOnlineDoctors.length > 0 ? liveOnlineDoctors.slice(0, 4) : doctors.slice(0, 4);
  const firstBookingDoctor = pulseDoctors[0] || null;


  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden bg-[#FAFAFA] text-slate-900 font-sans selection:bg-teal-600 selection:text-white">
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 1. FLOATING GLASSMORPHISM NAVBAR (rounded-full glass capsule)             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full px-3 sm:px-4 pt-3 sm:pt-4 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12">
          <div className="relative rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 border border-white/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5">
              {/* Brand logo */}
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-600/25 ring-2 ring-white/70 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <div className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                    City<span className="text-teal-600">Doctor</span>
                  </div>
                  <div className="hidden xl:block text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    24/7 Online Telehealth
                  </div>
                </div>
              </Link>

              {/* Desktop navigation links inside a soft segmented pill */}
              <nav className="hidden lg:flex items-center gap-1 text-[13px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/50 rounded-full p-1">
                <a
                  href="#choose-specialty"
                  className="px-3.5 py-1.5 rounded-full text-teal-700 dark:text-teal-300 bg-white dark:bg-slate-900/80 shadow-sm"
                >
                  Consultation
                </a>
                <Link
                  href="/department/all"
                  className="px-3.5 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900/80 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
                >
                  All Doctors
                </Link>
                <a
                  href="#diagnostic"
                  className="px-3.5 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900/80 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
                >
                  Home Diagnostic
                </a>
                <a
                  href="#health-plan"
                  className="px-3.5 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900/80 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
                >
                  Health Plan
                </a>
                <a
                  href="#blogs"
                  className="px-3.5 py-1.5 rounded-full hover:bg-white dark:hover:bg-slate-900/80 hover:text-teal-600 dark:hover:text-teal-300 transition-colors"
                >
                  Blogs
                </a>
              </nav>

              {/* Right actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Admin quick-access (compact) */}
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-teal-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Admin</span>
                </Link>

                {currentUser ? (
                  <div className="relative flex items-center">
                    <button
                      type="button"
                      onClick={() => setProfileMenuOpen((v) => !v)}
                      className="flex items-center gap-1.5 rounded-full pl-1 pr-2 py-1 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 transition-colors"
                      aria-haspopup="menu"
                      aria-expanded={profileMenuOpen}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-sm ring-2 ring-white/80 dark:ring-slate-800">
                        {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {profileMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                        <div
                          role="menu"
                          className="absolute right-0 top-[calc(100%+10px)] w-60 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl shadow-slate-900/10 p-2 space-y-1 animate-in zoom-in-95 fade-in duration-150 origin-top-right"
                        >
                          <div className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border border-teal-100 dark:border-slate-700 mb-1">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-[10px] text-teal-700 dark:text-teal-300 font-semibold mt-0.5">
                              {currentUser.phone}
                            </p>
                          </div>
                          <Link
                            href="/patient/appointments"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 transition-colors"
                          >
                            <CalendarDays className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            My Appointments
                          </Link>
                          <Link
                            href="/patient/settings"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 transition-colors"
                          >
                            <Settings className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Account Settings
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-rose-500/10 hover:text-red-600 transition-colors"
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
                    onClick={() => openAuthModal({ redirectTo: '/patient/appointments' })}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold shadow-sm transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Login / Sign Up</span>
                  </button>
                )}

                {/* Consult CTA (desktop) */}
                <button
                  onClick={() => handleOpenConsultation()}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white text-xs font-bold shadow-md shadow-teal-600/25 active:scale-95 transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Consult Now</span>
                </button>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>



          {/* Floating mobile drawer */}
          {mobileMenuOpen && (
            <div className="mt-2 lg:hidden rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 shadow-2xl shadow-slate-900/10 p-5 space-y-4 overflow-hidden">
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800 border border-teal-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center">
                      {currentUser.name?.trim()?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-teal-700 dark:text-teal-300">{currentUser.phone}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-300 text-xs font-bold border border-red-200 dark:border-rose-500/30"
                  >
                    Sign Out
                  </button>
                </div>
              )}

              <nav className="flex flex-col gap-1 text-sm">
                <a
                  href="#choose-specialty"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-bold text-teal-700 dark:text-teal-300 bg-slate-100/70 dark:bg-slate-800/60"
                >
                  Consultation
                </a>
                <Link
                  href="/department/all"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  All Doctors Directory
                </Link>
                <a
                  href="#diagnostic"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Home Diagnostic
                </a>
                <a
                  href="#health-plan"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Health Plan
                </a>
                <a
                  href="#blogs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                >
                  Blogs &amp; Media
                </a>
              </nav>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 space-y-3">
                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal({ redirectTo: '/patient/appointments' });
                    }}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                  >
                    <User className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Login / Sign Up</span>
                  </button>
                )}

                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-2xl flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700"
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Admin Dashboard
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenConsultation();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Consult a Doctor Now
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BENTO HERO GRID: Bold Search + Live Doctor Pulse + 1-Click Consult      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-slate-50 pt-6 sm:pt-10 pb-10 sm:pb-14 select-none">
        {/* Ambient gradient orbs */}
        <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-200/30 blur-3xl pointer-events-none" />
        <div className="absolute top-40 -right-24 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.06),transparent_45%)] pointer-events-none" />

        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 lg:auto-rows-fr">
            {/* ------------ BOX 1 · Bold headline + specialty search ------------ */}
            <div className="relative lg:col-span-2 lg:row-span-2 overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/70 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 lg:p-12 flex flex-col">
              {/* Subtle live campaign image from admin banners */}
              {banners.length > 0 && currentBanner?.imageUrl && (
                <div className="pointer-events-none absolute -right-10 -top-10 w-44 h-44 sm:w-60 sm:h-60 rounded-[2.5rem] overflow-hidden opacity-[0.16] rotate-6 blur-[1px]">
                  <img
                    src={currentBanner.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="relative flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200/80 dark:border-teal-500/30 text-teal-800 dark:text-teal-200 text-[11px] font-bold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                  </span>
                  Live • Avg. doctor response &lt; 2 minutes
                </span>
                {/* Banner campaign selector dots */}
                {banners.length > 1 && (
                  <div className="inline-flex items-center gap-1.5 ml-auto bg-white/80 border border-slate-200 rounded-full px-3 py-2">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveBannerIdx(i)}
                        aria-label={`Show banner ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeBannerIdx === i
                            ? 'w-5 bg-teal-600'
                            : 'w-1.5 bg-slate-300 hover:bg-teal-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <h1 className="relative mt-5 text-5xl md:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
                Consult Top Doctors Online,{' '}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                  Anytime, Anywhere.
                </span>
              </h1>

              <p className="relative mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Connect instantly with BMDC certified specialist physicians over encrypted HD
                video, get a digital prescription, and pay securely with bKash or Card.
              </p>

              {/* Trust chips */}
              <div className="relative mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  BMDC Certified
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  24/7 Available
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 · 15,000+ reviews
                </span>
              </div>

              {/* Search bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="relative mt-7 flex items-center gap-3 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] pl-5 pr-3 py-2.5 focus-within:ring-2 focus-within:ring-teal-500/40 transition-all"
              >
                <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by doctor, specialty or symptom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 whitespace-nowrap text-xs sm:text-sm bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full px-5 sm:px-7 py-2.5 font-bold transition-all active:scale-95"
                >
                  Search
                </button>
              </form>

              {/* Popular specialty pills */}
              <div className="relative mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Popular:
                </span>
                {[
                  { label: 'Fever & Cough', slug: 'general-physician' },
                  { label: 'Cardiology', slug: 'cardiology' },
                  { label: 'Dermatology', slug: 'dermatology' },
                  { label: 'Pediatrics', slug: 'pediatrics' },
                  { label: 'Mental Wellness', slug: 'psychiatry' },
                ].map((pill) => (
                  <button
                    key={pill.slug + pill.label}
                    type="button"
                    onClick={() => router.push(`/department/${pill.slug}`)}
                    className="px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:-translate-y-0.5 transition-all text-xs font-semibold shadow-sm"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Active campaign caption */}
              {banners.length > 0 && (
                <div className="relative mt-auto pt-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/80 border border-blue-100 dark:border-slate-700 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-600 text-blue-700 dark:text-teal-300 flex items-center justify-center shrink-0 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug line-clamp-2">
                      {currentBanner.title}
                      <span className="text-slate-400 dark:text-slate-400 font-normal">
                        {' '}
                        — {currentBanner.subtitle}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>


            {/* ------------ BOX 2 · Live doctor pulse widget ------------ */}
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/25">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                      Live Physician Pulse
                    </h2>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium mt-1">
                      Real-time availability
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  {liveOnlineDoctors.length} Online
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {pulseDoctors.length > 0 ? (
                  pulseDoctors.map((doc: any, idx: number) => {
                    const isOnline = (doc.status || '').toUpperCase() === 'ONLINE';
                    return (
                      <button
                        key={doc.id || idx}
                        type="button"
                        onClick={() => handleOpenConsultation(doc)}
                        className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-teal-300 dark:hover:border-teal-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all px-3 py-2.5 text-left group"
                      >
                        <span className="relative shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                          />
                          <span
                            className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                              isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                            {doc.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                            {doc.specialty}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${
                            isOnline
                              ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30'
                              : 'text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="py-10 flex flex-col items-center justify-center gap-3 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Loader2 className="w-7 h-7 animate-spin text-teal-500" />
                    <p className="text-xs text-slate-400">Syncing live physician feed...</p>
                  </div>
                )}
              </div>

              <p className="mt-auto pt-4 text-[10px] text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-500" />
                1800+ BMDC specialists • avg. wait &lt; 2 min
              </p>
            </div>



            {/* ------------ BOX 3 · 1-click consultation trigger ------------ */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 text-white shadow-2xl shadow-teal-600/30 p-5 sm:p-6 flex flex-col">
              <div className="absolute -top-14 -right-14 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-cyan-300/20 blur-2xl pointer-events-none" />

              <span className="relative inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-[10px] font-black uppercase tracking-widest">
                <Zap className="w-3 h-3" />
                Instant Booking
              </span>

              <h3 className="relative mt-4 text-2xl sm:text-[1.7rem] font-black leading-tight">
                Skip the waiting room.
              </h3>
              <p className="relative mt-1.5 text-xs sm:text-sm text-white/85 leading-relaxed">
                Start a video consult in under 2 minutes — get your digital prescription the
                moment your call ends.
              </p>

              <div className="relative mt-4 flex items-center gap-2">
                {pulseDoctors.slice(0, 3).map((doc: any, idx: number) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={doc.id || idx}
                    src={doc.image}
                    alt=""
                    className={`w-8 h-8 rounded-full object-cover border-2 border-white/70 shadow-md ${
                      idx !== 0 ? '-ml-2.5' : ''
                    }`}
                  />
                ))}
                {pulseDoctors.length > 0 && (
                  <span className="text-[10px] font-bold text-white/90">
                    {firstBookingDoctor?.name || 'Top doctors'} online now
                  </span>
                )}
              </div>

              <div className="relative mt-5 inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-950/20 border border-white/20 w-fit">
                <span className="text-[10px] uppercase tracking-wider font-bold text-white/75">
                  Consultation from
                </span>
                <span className="font-mono text-base font-black">
                  ৳{Number(firstBookingDoctor?.consultationFee || firstBookingDoctor?.fee || 500).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleOpenConsultation(firstBookingDoctor || undefined)}
                className="relative mt-4 w-full py-3.5 rounded-full bg-white text-teal-700 hover:bg-teal-50 font-black text-sm shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Video className="w-4 h-4" />
                Consult a Doctor Now
              </button>

              <div className="relative mt-4 flex flex-wrap items-center gap-1.5">
                {['bKash', 'Visa / Mastercard', 'E-Prescription'].map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[9px] font-bold"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 'CHOOSE A DEPARTMENT OR SYMPTOM' (ROUTES TO /department/[slug])         */}
      {/* ========================================================================= */}
      <section
        id="choose-specialty"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 scroll-mt-16 select-none"
      >
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-8">
          {/* Header with Title & Toggle Switch */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Choose a Department or Symptom
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Select your preferred clinical department or symptom to view verified physicians.
              </p>
            </div>

            {/* Toggle Switch: Departments vs Symptoms */}
            <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 self-start sm:self-auto shrink-0 shadow-inner">
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'departments'
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Departments
              </button>
              <button
                onClick={() => setActiveTab('symptoms')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'symptoms'
                    ? 'bg-blue-700 text-white shadow-md shadow-blue-700/20'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Symptoms
              </button>
            </div>
          </div>

          {/* VIEW A: DEPARTMENTS VIEW (Routes to /department/[slug]) */}
          {activeTab === 'departments' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 animate-in fade-in duration-300">
              {departments.map((dept, idx) => {
                const Icon = dept.icon;
                return (
                  <Link
                    key={idx}
                    href={`/department/${dept.slug}`}
                    className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-2 group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#e6f2ff] text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                      {dept.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {dept.sub}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* VIEW B: SYMPTOMS VIEW (Routes to /department/[slug]) */}
          {activeTab === 'symptoms' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 animate-in fade-in duration-300">
              {symptoms.map((sym, idx) => (
                <Link
                  key={idx}
                  href={`/department/${sym.slug}`}
                  className="p-4 rounded-2xl bg-[#e6f2ff] border border-blue-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center gap-3 group shadow-sm hover:scale-[1.02]"
                >
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
                    <img
                      src={sym.image}
                      alt={sym.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {sym.name}
                  </h3>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. QUICK SERVICES GRID (SCREENSHOT 1 BOTTOM)                             */}
      {/* ========================================================================= */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/department/all"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#e6f2ff] text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
              Live Video Consultation
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Connect with specialist doctors in less than 10 minutes via HD encrypted video call.
            </p>
          </Link>

          <div
            onClick={() => {
              const diagSection = document.getElementById('diagnostic');
              diagSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#e6f2ff] text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TestTube className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
              Diagnostic Tests
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Book medical lab tests at home with certified doorstep sample collection & 24h reports.
            </p>
          </div>

          <div
            onClick={() => {
              const corpSection = document.getElementById('corporate');
              corpSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#e6f2ff] text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
              Corporate Healthcare
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Custom digital health coverage, wellness plans, and doctor access for corporate teams.
            </p>
          </div>

          <Link
            href="/department/all"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-[#e6f2ff] text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
              Healthcare IT Services
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              EMR/EHR management, digital prescription engines, and hospital software solutions.
            </p>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. TRUST INDICATORS ROW (SCREENSHOT 2)                                   */}
      {/* ========================================================================= */}
      <section className="py-10 bg-[#f8fbff] border-t border-b border-blue-100 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="font-black text-2xl sm:text-3xl text-slate-900">1800+</div>
              <div className="text-xs font-semibold text-slate-500">BMDC verified doctors</div>
            </div>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="font-black text-2xl sm:text-3xl text-slate-900">10 Minutes</div>
              <div className="text-xs font-semibold text-slate-500">Average waiting time</div>
            </div>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-black text-2xl sm:text-3xl text-slate-900">820 K+</div>
              <div className="text-xs font-semibold text-slate-500">People trusted us</div>
            </div>

            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 fill-blue-700" />
              </div>
              <div className="font-black text-2xl sm:text-3xl text-slate-900">4.8</div>
              <div className="text-xs font-semibold text-slate-500">App store rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "ACCESS CONVENIENT ONLINE HEALTHCARE" SECTION (SCREENSHOT 3)           */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Access convenient online Healthcare
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Avoid long travel times, traffic jams, and crowded hospital waiting rooms. With CityDoctor, professional medical advice is just a click away from your smartphone or laptop.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Audio and HD Video Consultation anytime 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Instant Digital Prescriptions delivered directly to app & SMS</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Convenient bKash and Card payment checkout</span>
              </div>
            </div>

            <div className="pt-3">
              <Link
                href="/department/all"
                className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <span>Find Your Specialist</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center relative">
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#e6f2ff] flex items-center justify-center p-4 relative shadow-inner">
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800"
                  alt="Online doctor video call"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>

              <div className="absolute -bottom-2 right-4 bg-white border border-blue-200 p-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Dr. Sarah Jenkins</div>
                  <div className="text-[11px] text-emerald-600 font-semibold">● Connected (HD Video)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. HOME DIAGNOSTIC SERVICE (SCREENSHOT 5)                                 */}
      {/* ========================================================================= */}
      <section id="diagnostic" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
              <TestTube className="w-4 h-4" />
              <span>Doorstep Lab Sample Collection</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Sample collection at your Doorstep
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Get all routine and specialized lab tests done without leaving your home. Certified phlebotomists follow 100% hygienic protocol.
            </p>

            <div className="space-y-4 pt-1">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Faster booking</h4>
                  <p className="text-xs text-slate-500">
                    Book diagnostic tests in under 2 minutes through our website or helpline.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Certified professionals</h4>
                  <p className="text-xs text-slate-500">
                    Trained medical phlebotomists collect samples with vacuum blood tubes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Get report within 24 hours</h4>
                  <p className="text-xs text-slate-500">
                    Verified digital test reports delivered directly to your account & email.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleOpenConsultation()}
                className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all"
              >
                Book Test Online
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-md border-2 border-white">
              <Image
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=600"
                alt="Medical blood draw"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover"
              />
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div className="relative h-32 sm:h-34 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600"
                  alt="Medical report handover"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover"
                />
              </div>
              <div className="relative h-32 sm:h-34 rounded-2xl overflow-hidden shadow-md border-2 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600"
                  alt="Doctor reviewing lab results"
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. PREMIUM MEMBER & CORPORATE PARTNERS (SCREENSHOTS 6 & 7)                */}
      {/* ========================================================================= */}
      <section id="health-plan" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f0f7ff] border-t border-slate-200">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative w-full max-w-md h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=800"
                  alt="Family Health Plan"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-700" />
                <span>Annual Family Health Coverage</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Become a Premium Member
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Enjoy unlimited free GP consultations, up to 35% discount on home diagnostics, free medicine delivery, and specialized health coaching for your entire family.
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Unlimited Video Consults</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Family Coverage (Up to 5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Doorstep Diagnostic Discounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Priority Specialist Booking</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenConsultation()}
                  className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all"
                >
                  Get Premium Plan
                </button>
              </div>
            </div>
          </div>

          <div id="corporate" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8 border-t border-blue-200">
            <div className="lg:col-span-6 space-y-5 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
                <Building className="w-4 h-4 text-blue-700" />
                <span>Enterprise Employee Wellness</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Become a Corporate Partner
              </h2>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Empower your workforce with 24/7 digital healthcare access. Reduce sick leaves, boost productivity, and offer comprehensive employee health benefits.
              </p>

              <div className="space-y-2.5 text-xs font-semibold text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Custom corporate telemedicine packages for companies of any size</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Dedicated corporate dashboard & utilization analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Mental health webinars & preventive corporate health screenings</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleOpenConsultation()}
                  className="px-6 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all"
                >
                  Partner with Us
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 relative flex justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-md h-64 sm:h-80 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=800"
                  alt="Corporate Healthcare Partnership"
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. HOSPITAL PARTNERS (SCREENSHOT 8)                                       */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-18 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-8 text-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Our Hospital Partners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Top tier medical facilities and hospitals collaborating with CityDoctor.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Square Hospital', loc: 'Dhaka' },
              { name: 'Evercare Hospital', loc: 'Dhaka & Ctg' },
              { name: 'United Hospital', loc: 'Gulshan' },
              { name: 'Labaid Specialized', loc: 'Dhanmondi' },
              { name: 'Ibn Sina Hospital', loc: 'Dhaka' },
            ].map((partner, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center gap-1 hover:border-blue-400 hover:bg-blue-50/50 transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm mb-1 group-hover:scale-110 transition-transform">
                  H
                </div>
                <div className="font-extrabold text-sm text-slate-800 group-hover:text-blue-700 transition-colors">
                  {partner.name}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold">{partner.loc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MASS MEDIA & REVIEWS (SCREENSHOTS 9 & 10)                             */}
      {/* ========================================================================= */}
      <section id="media" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f8fbff] border-t border-slate-200">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-12">
          {/* Part A: CityDoctor in Mass Media */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                CityDoctor in Mass Media
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Featured coverage highlighting our technology and healthcare impact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  publisher: 'The Daily Star',
                  date: 'August 14, 2026',
                  title: 'How CityDoctor is transforming remote healthcare accessibility across rural Bangladesh.',
                  image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600',
                },
                {
                  publisher: 'Prothom Alo English',
                  date: 'July 28, 2026',
                  title: 'Instant video triage and doorstep blood testing: The new era of modern digital clinics.',
                  image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
                },
                {
                  publisher: 'Tech in Asia',
                  date: 'June 19, 2026',
                  title: 'CityDoctor crosses 820,000 satisfied patient consultations with AI triage integration.',
                  image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
                },
              ].map((article, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 350px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-blue-700 text-white font-bold text-[10px] shadow">
                        {article.publisher}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800 flex items-center gap-1">
                      <span>Read more</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Part B: Patient Testimonial Banner */}
          <div className="rounded-3xl bg-[#1e40af] text-white p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-6">
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/80 mx-auto shadow-lg relative">
                <Image
                  src={testimonials[activeTestimonialIdx].avatar}
                  alt={testimonials[activeTestimonialIdx].name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div>
                <h4 className="font-extrabold text-lg sm:text-xl text-white">
                  {testimonials[activeTestimonialIdx].name}
                </h4>
                <p className="text-xs text-blue-200">
                  {testimonials[activeTestimonialIdx].role}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-300" />
                ))}
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-blue-50 font-medium italic leading-relaxed">
                {testimonials[activeTestimonialIdx].comment}
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonialIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeTestimonialIdx === i
                        ? 'bg-white w-6'
                        : 'bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. APP DOWNLOAD SECTION (SCREENSHOT 11)                                  */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#e6f2ff] via-[#edf5ff] to-[#e0edff] border-t border-blue-200">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Side Text & Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs">
              <Smartphone className="w-4 h-4 text-blue-700" />
              <span>Mobile Healthcare Anywhere</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Download and register our App for free & get the privilege healthcare services
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
              Experience the fastest doctor consultations on the go. Manage digital prescriptions, access home diagnostic reports, and set medication reminders in one single app.
            </p>

            {/* App Store / Play Store Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#download"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all"
              >
                <div className="text-2xl font-black text-emerald-400">▶</div>
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    GET IT ON
                  </span>
                  <span className="text-sm font-bold tracking-wide">Google Play</span>
                </div>
              </a>

              <a
                href="#download"
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95 transition-all"
              >
                <div className="text-2xl font-black"></div>
                <div className="text-left leading-tight">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Download on the
                  </span>
                  <span className="text-sm font-bold tracking-wide">App Store</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>4.8 ★ Rated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1M+ Downloads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Data Lag</span>
              </div>
            </div>
          </div>

          {/* Right Side Mockup Phone with Overlapping QR Code */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-64 sm:w-72 h-[420px] rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 flex items-center justify-center">
              <div className="w-full h-full rounded-[28px] overflow-hidden bg-slate-950 relative">
                <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600"
                  alt="CityDoctor Mobile App"
                  fill
                  sizes="300px"
                  className="object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-black/40" />

                <div className="absolute bottom-4 left-4 right-4 text-white text-center space-y-1">
                  <div className="font-extrabold text-sm">CityDoctor Telehealth</div>
                  <div className="text-[10px] text-blue-200">Video Consultation in 2 Mins</div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white p-4 rounded-3xl shadow-2xl border border-blue-200 text-center space-y-1.5 flex flex-col items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-900 rounded-2xl p-2 flex items-center justify-center text-white">
                  <QrCode className="w-full h-full text-blue-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 block">
                  Scan to Download
                </span>
                <span className="text-[9px] text-blue-600 font-semibold block">
                  iOS & Android
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. HEALTH BLOG SECTION (SCREENSHOT 12)                                  */}
      {/* ========================================================================= */}
      <section id="blogs" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
                <FileText className="w-4 h-4" />
                <span>Expert Health Insights</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                Read our latest blogs from Health Experts
              </h2>
            </div>

            <Link
              href="/department/all"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 shrink-0"
            >
              <span>View All Blogs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogs.map((blog, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {blog.time}
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">{blog.author}</span>
                  <span className="text-blue-700 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. FAQ SECTION WITH INTERACTIVE ACCORDION (SCREENSHOT 13)                */}
      {/* ========================================================================= */}
      <section id="faqs" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#f8fbff] border-t border-slate-200 select-none">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest">
              <HelpCircle className="w-4 h-4" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Have Any Questions?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Find quick answers regarding our BMDC certified doctor consultations, prescriptions, and lab tests.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white ${
                    isOpen ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in-50 duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. CONTACT FORM SECTION (SCREENSHOT 14)                                  */}
      {/* ========================================================================= */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest">
              <MessageSquare className="w-4 h-4" />
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              We&apos;re here to help
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              We aim to reply to your query within 24 hours. For immediate medical assistance, please consult a doctor directly.
            </p>
          </div>

          <div className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200 shadow-xl relative">
            {contactSubmitted ? (
              <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Thank You!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Your query has been received. A CityDoctor support executive will contact you at your email address shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">What is your concern?</label>
                  <select
                    value={contactForm.concern}
                    onChange={(e) => setContactForm({ ...contactForm, concern: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="Doctor Consultation">Doctor Consultation</option>
                    <option value="Home Diagnostic">Home Diagnostic & Lab Test</option>
                    <option value="Corporate Health">Corporate Health Partnership</option>
                    <option value="Payment / Refund">Payment / bKash Refund Inquiry</option>
                    <option value="General Query">Other General Query</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Your query</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write your message or inquiry here..."
                    value={contactForm.query}
                    onChange={(e) => setContactForm({ ...contactForm, query: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-700/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Query</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 15. FULL-WIDTH SOLID BLUE FOOTER (BG-BLUE-600) (SCREENSHOT 15)           */}
      {/* ========================================================================= */}
      <footer className="bg-blue-600 text-white text-xs select-none">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1: Logo, Short Paragraph, Phone, Email & 5 Social Icons */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center shadow-md font-black text-lg">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="font-black text-2xl tracking-tight text-white">
                  CityDoctor
                </span>
              </Link>

              <p className="text-blue-100 text-xs leading-relaxed max-w-xs">
                CityDoctor is Bangladesh&apos;s leading digital healthcare platform providing 24/7 video consults, doorstep diagnostics, and corporate wellness coverage.
              </p>

              <div className="space-y-1 text-xs text-blue-100 font-medium">
                <div>Phone: <strong className="text-white">+880 9612-362867</strong></div>
                <div>Email: <strong className="text-white">support@citydoctor.com.bd</strong></div>
              </div>

              {/* 5 Social Media Icons */}
              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href="#facebook"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white text-white hover:text-blue-700 flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#twitter"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white text-white hover:text-blue-700 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#linkedin"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white text-white hover:text-blue-700 flex items-center justify-center transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#instagram"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white text-white hover:text-blue-700 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#youtube"
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white text-white hover:text-blue-700 flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Services & Doctor Links */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-blue-500/50 pb-2">
                Healthcare Services
              </h4>
              <ul className="space-y-2.5 text-blue-100 font-medium">
                <li><Link href="/department/all" className="hover:text-white transition-colors">Video Consultation</Link></li>
                <li><a href="#diagnostic" className="hover:text-white transition-colors">Home Diagnostic Tests</a></li>
                <li><a href="#health-plan" className="hover:text-white transition-colors">Family Health Plans</a></li>
                <li><a href="#corporate" className="hover:text-white transition-colors">Corporate Healthcare</a></li>
                <li><Link href="/department/all" className="hover:text-white transition-colors">Hospital Partners</Link></li>
                <li><Link href="/admin/doctors" className="hover:text-white transition-colors">Doctor Verification</Link></li>
              </ul>
            </div>

            {/* Col 3: Company & Policies */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-blue-500/50 pb-2">
                Company & Legal
              </h4>
              <ul className="space-y-2.5 text-blue-100 font-medium">
                <li><a href="#about" className="hover:text-white transition-colors">About CityDoctor</a></li>
                <li><a href="#faqs" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#bmdc" className="hover:text-white transition-colors">BMDC Guidelines</a></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Control Center</Link></li>
              </ul>
            </div>

            {/* Col 4: App Download Badges */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider border-b border-blue-500/50 pb-2">
                Download Our App
              </h4>
              <p className="text-xs text-blue-100">
                Get priority online doctor consultations 24/7 right from your mobile device.
              </p>

              <div className="space-y-2 pt-1">
                <a
                  href="#playstore"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white text-slate-900 shadow-md hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xl font-black text-emerald-600">▶</div>
                  <div className="text-left leading-tight">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                      Google Play Store
                    </span>
                    <span className="text-xs font-bold">Download Free</span>
                  </div>
                </a>

                <a
                  href="#appstore"
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white text-slate-900 shadow-md hover:bg-blue-50 transition-colors"
                >
                  <div className="text-xl font-black text-slate-900"></div>
                  <div className="text-left leading-tight">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">
                      Apple App Store
                    </span>
                    <span className="text-xs font-bold">Download Free</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width White Strip with Centered Copyright */}
        <div className="w-full bg-white text-slate-600 py-4 px-4 border-t border-slate-200 text-center text-xs font-semibold">
          Copyright © 2026 CityDoctor. All rights reserved.
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* BKASH & CARD PAYMENT CHECKOUT MODAL                                       */}
      {/* ========================================================================= */}
      <PaymentCheckoutModal
        doctor={selectedDoctorForPayment}
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedDoctorForPayment(null);
        }}
      />
    </div>
  );
}
