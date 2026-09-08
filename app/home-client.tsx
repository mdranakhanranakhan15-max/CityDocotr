'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  PhoneCall,
  Video,
  Zap,
  ShieldCheck,
  Star,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Stethoscope,
  Baby,
  Sparkles,
  Activity,
  Heart,
  Brain,
  Smile,
  Bone,
  HeartPulse,
  Pill,
  Microscope,
  FlaskConical,
  ChevronDown,
  Smartphone,
  Mail,
  MapPin,
  Loader2,
  Lock,
  FileText,
  Truck,
  Upload,
  Users,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import DoctorCard, { DoctorCardDoctor } from '@/components/DoctorCard';
import BookingModal from '@/components/BookingModal';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

const FALLBACK_DOCTORS: DoctorCardDoctor[] = [
  {
    id: 'fd1',
    name: 'Prof. Dr. Mahbubur Rahman',
    gender: 'male',
    bmdc: 'A-27891',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Cardiology), FACC',
    specialties: 'Cardiology (Heart)',
    experienceYears: 24,
    rating: 4.9,
    reviewsCount: 1248,
    totalVisits: 9820,
    consultationFee: 750,
    fee: 900,
    workplace: 'National Institute of Cardiovascular Diseases (NICVD)',
    isOnline: true,
  },
  {
    id: 'fd2',
    name: 'Dr. Farhana Yasmin',
    gender: 'female',
    bmdc: 'A-38741',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, DGO, MCPS, FCPS (Gynae & Obs)',
    specialties: 'Gynaecology & Pregnancy',
    experienceYears: 16,
    rating: 4.8,
    reviewsCount: 863,
    totalVisits: 6140,
    fee: 800,
    workplace: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    isOnline: true,
  },
  {
    id: 'fd3',
    name: 'Dr. Tanvir Ahmed',
    gender: 'male',
    bmdc: 'A-49812',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Medicine), MACP (USA)',
    specialties: 'General Physician (Medicine)',
    experienceYears: 13,
    rating: 4.9,
    reviewsCount: 2417,
    totalVisits: 15240,
    consultationFee: 450,
    fee: 600,
    workplace: 'Dhaka Medical College & Hospital',
    isOnline: true,
  },
  {
    id: 'fd4',
    name: 'Dr. Sadia Afrin',
    gender: 'female',
    bmdc: 'A-67102',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, DEM (BIRDEM), MACP (Endocrinology)',
    specialties: 'Diabetes & Hormone',
    experienceYears: 11,
    rating: 4.7,
    reviewsCount: 542,
    totalVisits: 4100,
    fee: 650,
    workplace: 'BIRDEM General Hospital',
    isOnline: false,
  },
  {
    id: 'fd5',
    name: 'Dr. Rafiqul Islam',
    gender: 'male',
    bmdc: 'B-11024',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Pediatrics)',
    specialties: 'Pediatrics (Child Health)',
    experienceYears: 15,
    rating: 4.8,
    reviewsCount: 931,
    totalVisits: 7310,
    fee: 600,
    workplace: 'Shaheed Suhrawardy Medical College Hospital',
    isOnline: true,
  },
  {
    id: 'fd6',
    name: 'Dr. Nusrat Jahan',
    gender: 'female',
    bmdc: 'B-20357',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Dermatology)',
    specialties: 'Dermatology (Skin & Hair)',
    experienceYears: 12,
    rating: 4.9,
    reviewsCount: 1205,
    totalVisits: 8670,
    fee: 700,
    workplace: 'Combined Military Hospital, Dhaka',
    isOnline: true,
  },
  {
    id: 'fd7',
    name: 'Dr. Ashraful Haque',
    gender: 'male',
    bmdc: 'B-33110',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Neurology)',
    specialties: 'Neurology (Brain & Nerve)',
    experienceYears: 19,
    rating: 4.6,
    reviewsCount: 420,
    totalVisits: 2980,
    fee: 850,
    workplace: 'National Institute of Neurosciences & Hospital',
    isOnline: false,
  },
  {
    id: 'fd8',
    name: 'Dr. Sharmin Sultana',
    gender: 'female',
    bmdc: 'C-05108',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    degrees: 'MBBS, FCPS (Psychiatry)',
    specialties: 'Psychiatry & Mental Health',
    experienceYears: 9,
    rating: 4.7,
    reviewsCount: 315,
    totalVisits: 2210,
    fee: 500,
    workplace: 'Dhaka Medical College & Hospital',
    isOnline: true,
  },
];

const DEPARTMENTS: {
  name: string;
  slug: string;
  icon: any;
}[] = [
  { name: 'General Physician', slug: 'general-physician', icon: Stethoscope },
  { name: 'Gynaecology & Obs', slug: 'gynae-obs', icon: HeartPulse },
  { name: 'Pediatrics (Child Care)', slug: 'pediatrics', icon: Baby },
  { name: 'Dermatology (Skin & Hair)', slug: 'dermatology', icon: Sparkles },
  { name: 'Cardiology (Heart)', slug: 'cardiology', icon: Heart },
  { name: 'Psychiatry & Mental Health', slug: 'psychiatry', icon: Smile },
  { name: 'Internal Medicine', slug: 'internal-medicine', icon: Activity },
  { name: 'Orthopedics (Bone & Joint)', slug: 'orthopedics', icon: Bone },
  { name: 'Neurology (Brain & Nerve)', slug: 'neurology', icon: Brain },
  { name: 'Endocrinology & Diabetes', slug: 'endocrinology', icon: Activity },
];

const POPULAR_SYMPTOMS: { label: string; slug: string }[] = [
  { label: 'Fever & Flu', slug: 'general-physician' },
  { label: 'Stomach Pain & Gas', slug: 'internal-medicine' },
  { label: 'Skin & Acne', slug: 'dermatology' },
  { label: 'Child Cough', slug: 'pediatrics' },
  { label: 'Headache & Migraine', slug: 'neurology' },
  { label: 'Diabetes Care', slug: 'endocrinology' },
  { label: 'High Blood Pressure', slug: 'cardiology' },
  { label: 'Pregnancy Care', slug: 'gynae-obs' },
];

// Maps the lucide icon name stored on a CMS Department row to the imported
// component so Admin-editable icons render on the homepage without a dynamic
// import. Falls back to Stethoscope for unknown names.
const DEPT_ICON_MAP: Record<string, any> = {
  Stethoscope, HeartPulse, Baby, Sparkles, Heart, Smile, Activity, Bone, Brain,
  Pill, Microscope, FlaskConical, Users, ShieldCheck, Zap, Video, Clock, Lock,
};

const TRUST_BADGES = [
  { icon: ShieldCheck, label: '100% BMDC Certified Doctors' },
  { icon: FileText, label: 'Instant Digital e-Prescription' },
  { icon: Lock, label: '100% Private & Encrypted' },
];

const HERO_STATS: { value: string; label: string; labelKey?: string }[] = [
  { value: '500K+', label: 'Patients Served', labelKey: 'stats.patientsServed' },
  { value: '2,500+', label: 'BMDC Doctors', labelKey: 'stats.bmdcDoctors' },
  { value: '98.4%', label: 'Satisfaction', labelKey: 'stats.satisfaction' },
];

const SERVICE_CARDS: {
  icon: any;
  color: string;
  iconWrap: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}[] = [
  {
    icon: Video,
    color: 'text-blue-600',
    iconWrap: 'bg-blue-50',
    title: 'Video Consult',
    desc: 'Connect with specialists in minutes via HD video with digital e-prescriptions.',
    cta: 'Book Now',
    href: '#doctors',
  },
  {
    icon: FlaskConical,
    color: 'text-teal-600',
    iconWrap: 'bg-teal-50',
    title: 'Home Lab Test',
    desc: 'Trained professionals collect samples from your home. Digital reports in 24 hrs.',
    cta: 'Learn More',
    href: '#diagnostic',
  },
  {
    icon: Pill,
    color: 'text-violet-600',
    iconWrap: 'bg-violet-50',
    title: 'Medicine Delivery',
    desc: 'Order authentic medicines with fast doorstep delivery and flat 10% discount.',
    cta: 'Shop Now',
    href: '#medicine',
  },
  {
    icon: Users,
    color: 'text-amber-600',
    iconWrap: 'bg-amber-50',
    title: 'Subscription',
    desc: 'Full healthcare packages for your entire family with unlimited consults.',
    cta: 'See Plans',
    href: '#health-plans',
  },
];

const MEDICINE_CATEGORIES = [
  'All',
  'Fever & Pain',
  'Gastric & Acidity',
  'Vitamins & Supplements',
  'Respiratory & Allergy',
  'Allergy & Cold',
];

const MEDICINES: {
  name: string;
  comp: string;
  brand: string;
  form: string;
  price: number;
  oldPrice: number;
  cat: string;
  tile: string;
  image?: string;
  id?: string;
}[] = [
  { name: 'Napa Extra', comp: 'Paracetamol 500mg + Caffeine 65mg', brand: 'Beximco Pharma', form: 'Tablet', price: 30, oldPrice: 35, cat: 'Fever & Pain', tile: 'bg-rose-50 text-rose-500' },
  { name: 'Seclo 20', comp: 'Omeprazole 20mg', brand: 'Square Pharma', form: 'Capsule', price: 65, oldPrice: 75, cat: 'Gastric & Acidity', tile: 'bg-emerald-50 text-emerald-500' },
  { name: 'Monas 10', comp: 'Montelukast Sodium 10mg', brand: 'Acme Laboratories', form: 'Tablet', price: 160, oldPrice: 180, cat: 'Respiratory & Allergy', tile: 'bg-sky-50 text-sky-500' },
  { name: 'Fexo 120', comp: 'Fexofenadine HCl 120mg', brand: 'Renata Limited', form: 'Tablet', price: 90, oldPrice: 105, cat: 'Allergy & Cold', tile: 'bg-violet-50 text-violet-500' },
  { name: 'Napa 500', comp: 'Paracetamol 500mg', brand: 'Beximco Pharma', form: 'Tablet', price: 20, oldPrice: 25, cat: 'Fever & Pain', tile: 'bg-orange-50 text-orange-500' },
  { name: 'Alatrol 10', comp: 'Cetirizine HCl 10mg', brand: 'Incepta Pharma', form: 'Tablet', price: 15, oldPrice: 20, cat: 'Allergy & Cold', tile: 'bg-cyan-50 text-cyan-500' },
  { name: 'Maxpro 20', comp: 'Pantoprazole 20mg', brand: 'Healthcare Pharma', form: 'Tablet', price: 70, oldPrice: 85, cat: 'Gastric & Acidity', tile: 'bg-lime-50 text-lime-600' },
  { name: 'Calbo-D3', comp: 'Calcium 500mg + Vitamin D3', brand: 'Square Pharma', form: 'Tablet', price: 200, oldPrice: 220, cat: 'Vitamins & Supplements', tile: 'bg-amber-50 text-amber-500' },
];

const LAB_PACKS: {
  name: string;
  meta: string;
  tag: string;
  price: number;
  oldPrice: number;
  popular?: boolean;
  features?: string[];
  id?: string;
}[] = [
  { name: 'Comprehensive Health Checkup', meta: '68 Tests Included', tag: 'Full Body Screening', price: 1999, oldPrice: 3999, popular: true },
  { name: 'Disease Specific Panel', meta: '24 Tests Included', tag: 'Diabetes & Thyroid', price: 999, oldPrice: 1499 },
  { name: 'Heart Health Checkup', meta: '18 Tests Included', tag: 'Cardiac Risk Profile', price: 1499, oldPrice: 1999 },
];

const PLANS: {
  name: string;
  tagline: string;
  members: number;
  monthly?: number;
  yearly: number;
  features: string[];
  popular?: boolean;
  accent: string;
  id?: string;
}[] = [
  {
    name: 'Individual Health Shield',
    tagline: 'Ideal for young professionals & individuals',
    members: 1,
    yearly: 2490,
    accent: 'from-blue-500 to-blue-600',
    features: [
      '6 Free Video Consultations with General Physicians',
      '10% Flat Discount on all doorstep medicine orders',
      '15% Discount on all home diagnostic lab tests',
      'Digital health records vault with lifetime storage',
    ],
  },
  {
    name: 'DocTime Plus Care',
    tagline: 'Our most popular comprehensive healthcare package',
    members: 2,
    yearly: 4990,
    popular: true,
    accent: 'from-blue-700 to-indigo-700',
    features: [
      'Unlimited Video Consultations with General Physicians',
      '4 Free Specialist Doctor Consultations per year',
      '15% Flat Discount on all medicines with free delivery',
      '25% Discount on home diagnostic lab tests',
      'Priority appointment scheduling & 24/7 hotline access',
    ],
  },
  {
    name: 'Family Total Protection',
    tagline: 'Complete medical safety net for parents and children',
    members: 5,
    yearly: 8990,
    accent: 'from-slate-800 to-slate-900',
    features: [
      'Unlimited 24/7 video consultations with General Physicians',
      '10 Specialist Doctor consultations across all departments',
      'Covers up to 5 family members (Parents, Spouse & Children)',
      '20% Flat discount on all medicines with free delivery',
      'Digital health vault for the whole family',
    ],
  },
];

const STEPS: { no: string; icon: any; title: string; desc: string }[] = [
  {
    no: '01',
    icon: Stethoscope,
    title: 'Select Doctor or Specialty',
    desc: 'Browse 2,500+ BMDC certified doctors by symptoms, specialty, experience, and patient ratings.',
  },
  {
    no: '02',
    icon: Video,
    title: 'HD Video Consult in 10 Mins',
    desc: 'Connect with the doctor from anywhere in Bangladesh on an encrypted, confidential video call.',
  },
  {
    no: '03',
    icon: FileText,
    title: 'Instant Digital e-Prescription',
    desc: 'Receive a legally valid BMDC registered digital prescription with verified dosage & medication.',
  },
  {
    no: '04',
    icon: Truck,
    title: 'Doorstep Meds & Lab Tests',
    desc: 'Order prescribed medicines at 10% discount in 2 hrs or book home diagnostic sample collection.',
  },
];

const TRUST_FEATURES: { icon: any; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: '100% BMDC Certified Doctors',
    desc: 'Every doctor on our platform is strictly verified against the Bangladesh Medical & Dental Council registry before onboarding.',
  },
  {
    icon: Lock,
    title: 'Confidential & Encrypted',
    desc: 'End-to-end encrypted video streams and private cloud storage for all your medical reports and electronic prescriptions.',
  },
  {
    icon: Clock,
    title: '24/7 Availability Across BD',
    desc: 'Doctors available day and night, even on national holidays. Express medicine delivery active across all major metropolitan areas.',
  },
];

const TESTIMONIALS: { quote: string; name: string; place: string; rating: number }[] = [
  {
    quote:
      '“CityDoctor is a lifesaver for our family. When my 4-year-old had sudden midnight fever, Dr. Rafiqul was online within 6 minutes. The e-prescription was clear and medicine arrived in the morning.”',
    name: 'Shahrin Sultana',
    place: 'Uttara, Dhaka • Pediatrics Consultation',
    rating: 5,
  },
  {
    quote:
      '“Living outside Dhaka, getting an appointment with a BSMMU doctor used to take weeks. With CityDoctor, we consulted Prof. Mahmudul Alam for my mother’s cardiac checkup right from our living room.”',
    name: 'Tanmoy Bhowmick',
    place: 'Sylhet Sadar • Cardiology Review',
    rating: 5,
  },
  {
    quote:
      '“The home sample collection service for diabetes checkup was so seamless. Phlebotomist came at 7:30 AM in PPE, and I received digital reports by 6 PM. Highly recommended!”',
    name: 'Mahmudur Rahman',
    place: 'Gulshan, Dhaka • Executive Full Body Checkup',
    rating: 5,
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How does an online doctor consultation work on CityDoctor?',
    a: 'Select a doctor or medical specialty, choose “Instant Video Call” (or pick a convenient time slot), and enter your symptoms. You will be connected directly with the doctor via encrypted high-definition video call. At the end of the session, your official BMDC digital e-prescription is automatically issued.',
  },
  {
    q: 'Is the digital e-prescription legally valid for buying medicines?',
    a: 'Yes. Every e-prescription carries the doctor’s verified BMDC registration and a secure QR code, making it legally valid at any registered pharmacy across Bangladesh — including for ordering through our own Medicine Delivery service.',
  },
  {
    q: 'How does doorstep medicine delivery and home sample collection work?',
    a: 'Upload your prescription or choose from over-the-counter medicines — a licensed pharmacist verifies the order and it is delivered to your door in 2-4 hours with flat 10% savings. For lab tests, a certified phlebotomist visits your home with sterile equipment and your digital reports are delivered within 24 hours.',
  },
  {
    q: 'What if I need a follow-up consultation?',
    a: 'Your consultation history and digital health records are stored securely in your private health vault. Doctors can schedule follow-ups directly, and patients get a discounted follow-up rate when reconnecting with the same doctor within 14 days.',
  },
];

/* ---- static demo data above ---- */






// =====================================================================
// Database → UI adapters for the dynamic Marketplace sections. When the
// /api endpoints return live rows we map them into the exact shape the
// section JSX below renders (with the static arrays above kept purely as
// an offline / pre-seed fallback).
const CATALOG_TILE_COLORS = [
  'bg-rose-50 text-rose-500',
  'bg-emerald-50 text-emerald-500',
  'bg-sky-50 text-sky-500',
  'bg-violet-50 text-violet-500',
  'bg-orange-50 text-orange-500',
  'bg-cyan-50 text-cyan-500',
  'bg-lime-50 text-lime-600',
  'bg-amber-50 text-amber-500',
];

const stringHash = (s: string) =>
  Array.from(s || '').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 997, 7);

const toMedicineCard = (m: any): (typeof MEDICINES)[number] => {
  const regular = Number(m.regularPrice || 0);
  const discounted = Number(m.discountedPrice || 0);
  const price = discounted || regular;
  const oldPrice = regular > discounted ? regular : price;
  return {
    id: m.id,
    name: m.name || 'Medicine',
    comp: m.composition || '',
    brand: m.brand || '',
    form: m.form || 'Medicine',
    price,
    oldPrice,
    cat: m.category || 'General',
    tile: CATALOG_TILE_COLORS[stringHash(m.name || '') % CATALOG_TILE_COLORS.length],
    image: m.imageUrl || '',
  };
};

const toLabCard = (p: any): (typeof LAB_PACKS)[number] => ({
  id: p.id,
  name: p.title || 'Health Checkup',
  meta: `${Number(p.testsCount || 0)} Tests Included`,
  tag: p.category || 'Health Checkup',
  price: Number(p.discountedPrice || p.regularPrice || 0),
  oldPrice: Number(p.regularPrice || p.discountedPrice || 0),
  popular: Boolean(p.popular),
  features: Array.isArray(p.features) ? p.features.filter(Boolean) : [],
});

const toPlanCard = (p: any): (typeof PLANS)[number] => ({
  id: p.id,
  name: p.name || 'Membership Plan',
  tagline: p.tagline || '',
  members: Number(p.familyMembers || 1),
  monthly: Number(p.monthlyPrice || 0),
  yearly: Number(p.yearlyPrice || 0),
  features: Array.isArray(p.features) ? p.features.filter(Boolean) : [],
  popular: Boolean(p.popular),
  accent: 'from-blue-700 to-indigo-700',
});

export default function CityDoctorLandingPage() {
  const router = useRouter();
  const {
    addItem: addCartItem,
    openCart,
    getQty,
  } = useCart();
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState<DoctorCardDoctor[]>([]);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);
  // Doctor Time-Slot Selection Modal (payment only after a slot is chosen).
  const [bookingDoctor, setBookingDoctor] = useState<any | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [onlineOnly, setOnlineOnly] = useState(true);
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [sortBy, setSortBy] = useState('recommended');
  const [productCategory, setProductCategory] = useState('All');
  const [billing, setBilling] = useState<'yearly' | 'monthly'>('yearly');
  const [searchQuery, setSearchQuery] = useState('');
  // Live marketplace catalogue (MongoDB) — static arrays remain the fallback.
  const [medicineItems, setMedicineItems] = useState<(typeof MEDICINES)[number][]>(MEDICINES);
  const [labPackItems, setLabPackItems] = useState<(typeof LAB_PACKS)[number][]>(LAB_PACKS);
  const [planItems, setPlanItems] = useState<(typeof PLANS)[number][]>(PLANS);
  // CMS-controlled homepage headline figures (Admin -> Settings -> Site Stats).
  const [heroStats, setHeroStats] = useState(HERO_STATS);
  // Becomes true once /api/settings resolves (success OR failure) so the hero
  // stats band can show a loader instead of the hardcoded fallback text.
  const [heroStatsReady, setHeroStatsReady] = useState(false);
  // "Doctors Online" badge text, controlled from the Admin -> Settings CMS.
  const [onlineBadgeText, setOnlineBadgeText] = useState('');
  // Live verified-doctor counts per specialty slug (from /api/specialties).
  const [specialtyCounts, setSpecialtyCounts] = useState<Record<string, number>>({});
  const [deptTab, setDeptTab] = useState<'departments' | 'symptoms'>('departments');
  const [cmsDepartments, setCmsDepartments] = useState<any[]>([]);
  const [cmsSymptoms, setCmsSymptoms] = useState<any[]>([]);
  // Patient reviews / testimonials fetched live from /api/reviews (MongoDB).
  const [testimonials, setTestimonials] = useState(TESTIMONIALS);

  // Fetch the live doctor feed once
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch('/api/doctors');
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors) && data.doctors.length > 0) {
          setDoctors(data.doctors);
        }
      } catch (e) {
        console.error('Error fetching doctors:', e);
      } finally {
        setDoctorsLoaded(true);
      }
    }
    fetchDoctors();
  }, []);

  // Fetch the live marketplace catalogue (medicines, lab tests & health plans).
  useEffect(() => {
    async function fetchMarketplace() {
      try {
        const [medRes, labRes, planRes] = await Promise.all([
          fetch('/api/medicines'),
          fetch('/api/lab-tests'),
          fetch('/api/health-plans'),
        ]);
        const [medData, labData, planData] = await Promise.all([
          medRes.json(),
          labRes.json(),
          planRes.json(),
        ]);
        if (medData.success && Array.isArray(medData.medicines) && medData.medicines.length > 0) {
          setMedicineItems(medData.medicines.map(toMedicineCard));
        }
        if (labData.success && Array.isArray(labData.packages) && labData.packages.length > 0) {
          setLabPackItems(labData.packages.map(toLabCard));
        }
        if (planData.success && Array.isArray(planData.plans) && planData.plans.length > 0) {
          setPlanItems(planData.plans.map(toPlanCard));
        }
      } catch (e) {
        console.error('Error fetching marketplace catalogue:', e);
      }
    }
    fetchMarketplace();
  }, []);

  // Fetch CMS-controlled homepage stats, live specialty doctor counts and the
  // patient reviews/testimonials (all managed from the Admin Panel).
  useEffect(() => {
    async function fetchSiteStatsAndCounts() {
      try {
        const [cfgRes, specRes, revRes, deptRes, sympRes] = await Promise.all([
          fetch('/api/settings', { cache: 'no-store' }),
          fetch('/api/specialties', { cache: 'no-store' }),
          fetch('/api/reviews', { cache: 'no-store' }),
          fetch('/api/departments', { cache: 'no-store' }),
          fetch('/api/symptoms', { cache: 'no-store' }),
        ]);
        const cfg = await cfgRes.json();
        const spec = await specRes.json();
        let dept = {} as any;
        let symp = {} as any;
        try {
          dept = await deptRes.json();
        } catch {
          /* departments feed optional */
        }
        try {
          symp = await sympRes.json();
        } catch {
          /* symptoms feed optional */
        }
        let rev = {} as any;
        try {
          rev = await revRes.json();
        } catch {
          /* reviews feed optional */
        }

        if (cfg.success && cfg.stats) {
          setHeroStats([
            { value: cfg.stats.patientsServed || '500K+', label: 'Patients Served' },
            { value: cfg.stats.bmdcDoctors || '2,500+', label: 'BMDC Doctors' },
            { value: cfg.stats.satisfactionRate || '98.4%', label: 'Satisfaction' },
          ]);
          if (cfg.stats.onlineDoctors) {
            setOnlineBadgeText(String(cfg.stats.onlineDoctors));
          }
        }
        if (spec.success && spec.counts) {
          setSpecialtyCounts(spec.counts);
        }
        if (dept.success && Array.isArray(dept.departments) && dept.departments.length > 0) {
          setCmsDepartments(dept.departments);
        }
        if (symp.success && Array.isArray(symp.symptoms) && symp.symptoms.length > 0) {
          setCmsSymptoms(symp.symptoms);
        }
        if (rev.success && Array.isArray(rev.reviews) && rev.reviews.length > 0) {
          const mapped = rev.reviews.map((t: any) => ({
            quote: t.quote || t.text || '',
            name: t.name || 'Patient',
            place: t.place || t.location || '',
            rating: Math.max(1, Math.min(5, Math.round(Number(t.rating) || 5))),
          }));
          setTestimonials(mapped);
        }
      } catch (e) {
        console.error('Error fetching site stats, counts & reviews:', e);
      }
    }
    fetchSiteStatsAndCounts();
  }, []);

  const isDocOnline = (d: DoctorCardDoctor | any) =>
    d?.isOnline === true || (d?.status || '').toUpperCase() === 'ONLINE';

  const roster: DoctorCardDoctor[] =
    doctorsLoaded && doctors.length > 0 ? doctors : FALLBACK_DOCTORS;

  const visibleRoster = roster
    .filter((d) => {
      if (onlineOnly && !isDocOnline(d)) return false;
      const g = (d as any).gender || '';
      if (genderFilter !== 'all' && g && g.toLowerCase() !== genderFilter) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'consulted') return Number(b.totalVisits || 0) - Number(a.totalVisits || 0);
      if (sortBy === 'fee') return Number(a.fee || a.consultationFee || 0) - Number(b.fee || b.consultationFee || 0);
      return 0;
    })
    .slice(0, 8);

  const heroDoctor = roster.find(isDocOnline) || roster[0] || FALLBACK_DOCTORS[0];
  const activeOnlineCount = roster.filter(isDocOnline).length;
  const liveCount = activeOnlineCount > 0 ? activeOnlineCount : 140;

  // SLOT-FIRST BOOKING RULE — a card/CTA click opens the Doctor Time-Slot
  // Selection modal. Payment (bKash/card) only appears AFTER the patient picks
  // a date + time, when BookingModal routes to the /checkout page.
  const openBookingModal = (doctor?: any) => {
    const target = doctor || visibleRoster[0] || roster[0] || null;
    setBookingDoctor(target);
    setIsBookingModalOpen(true);
  };

  // Kept as an alias so every existing "Consult" CTA follows the slot-first flow.
  const handleOpenConsultation = openBookingModal;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/department/${q.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : '/department/all');
  };

  const handleSymptomClick = (slug: string) => {
    router.push(`/department/${slug}`);
  };

  const addMedicineToCart = (m: any) => {
    const key = String(m.id || m.name);
    // Already in the basket? Re-open the cart drawer to adjust quantity.
    if (getQty(key) > 0) {
      openCart();
      return;
    }
    addCartItem({
      id: key,
      name: m.name,
      brand: m.brand || '',
      composition: m.comp || '',
      form: m.form || 'Medicine',
      category: m.cat || '',
      image: m.image || '',
      unitPrice: Number(m.price || 0),
      originalPrice: Number(m.oldPrice || m.price || 0),
    });
  };

  // Category chips are derived from the live medicine feed (merged with presets).
  const productCategories = [
    'All',
    ...Array.from(new Set([...MEDICINE_CATEGORIES.slice(1), ...medicineItems.map((m) => m.cat)])),
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      <Navbar onConsultClick={() => handleOpenConsultation()} />


      <main className="pt-16 lg:pt-[116px]">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white">
          <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] bg-blue-100/50 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-40 -left-32 w-96 h-96 bg-sky-100/60 rounded-full blur-3xl" />

          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-8 lg:pt-14 pb-8 lg:pb-10 relative">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
              {/* ===== LEFT — headline / search ===== */}
              <div className="flex flex-col gap-5">
                <div className="inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] font-bold text-slate-500 tracking-wide">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    TRUSTED BY 2M+ USERS
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>140+ BMDC DOCTORS LIVE</span>
                  <span className="text-slate-300">•</span>
                  <span>Avg. wait ~4 mins</span>
                </div>

                <div className="inline-flex items-center gap-2 w-fit rounded-full bg-white border border-blue-100 shadow-sm px-3.5 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[11px] font-extrabold text-blue-700 uppercase tracking-[0.14em]">
                    {t('hero.badge', 'Healthcare in 10 Minutes').toUpperCase()}
                  </span>
                </div>

                <h1 className="text-[40px] leading-[1.05] lg:text-[58px] font-extrabold tracking-tight text-slate-900">
                  {t('hero.title1', 'Quality Healthcare')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500">
                    {t('hero.title2', 'in 10 Minutes.')}
                  </span>
                  <br className="hidden sm:block" /> {t('hero.title3', 'Anytime, Anywhere.')}
                </h1>

                <p className="text-[15px] lg:text-[16.5px] leading-relaxed text-slate-500 max-w-xl">
                  Connect with 2,500+ BMDC-certified specialists within 10 minutes via encrypted
                  video call. Receive official digital e-prescriptions and order authentic
                  medicines directly to your door.
                </p>

                {/* Search */}
                <form
                  onSubmit={handleSearchSubmit}
                  className="w-full max-w-xl flex items-center gap-2 bg-white border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100 rounded-full p-1.5 pl-5 shadow-lg shadow-slate-900/[0.04]"
                >
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    type="text"
                    placeholder="Search for doctors, specialties, or symptoms..."
                    className="w-full bg-transparent border-none text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[13.5px] font-bold rounded-full px-5 py-2.5 transition-colors shrink-0"
                  >
                    Find Doctor
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Popular symptoms */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    <Zap className="w-3.5 h-3.5 text-blue-600" fill="currentColor" />
                    Popular:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_SYMPTOMS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => handleSymptomClick(s.slug)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-[12.5px] font-semibold text-slate-600 transition-all"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== RIGHT — LIVE TELEHEALTH DESK ===== */}
              <div className="relative flex flex-col gap-5">
                <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-blue-900/[0.07] overflow-hidden">
                  {/* header band */}
                  <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-500 px-6 py-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-white font-extrabold tracking-widest text-[12px] uppercase">
                          Live Telehealth Desk
                        </span>
                        <span className="text-blue-100 text-[11px] font-semibold">
                          Doctor available for instant video call
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-[10.5px] font-bold uppercase tracking-wide border border-white/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      Ready to Connect
                    </span>
                  </div>

                  <div className="p-6">
                    {/* doctor row */}
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          heroDoctor?.image ||
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={heroDoctor?.name || 'Doctor'}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-50 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[16px] font-extrabold text-slate-900 truncate">
                            {heroDoctor?.name || 'Dr. Tanvir Ahmed'}
                          </h3>
                          <BadgeCheck className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                        </div>
                        <p className="text-[12px] text-slate-500 font-semibold mt-0.5 truncate">
                          {heroDoctor?.degrees || 'MBBS, FCPS (Medicine)'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-slate-700">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {heroDoctor?.rating ? Number(heroDoctor.rating).toFixed(1) : '4.9'}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-[11.5px] text-slate-500 font-semibold">
                            {Number(heroDoctor?.totalVisits || 4850).toLocaleString()}+ Consultations
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* connect hint */}
                    <div className="mt-4 flex items-center gap-2.5 bg-blue-50/70 border border-blue-100 rounded-2xl px-4 py-3">
                      <span className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <Video className="w-4 h-4" />
                      </span>
                      <p className="text-[12.5px] font-semibold text-slate-600 leading-snug">
                        Connects via HD video call in less than{' '}
                        <span className="text-blue-700 font-extrabold">5 minutes</span> — your wait
                        starts now.
                      </p>
                    </div>

                    {/* fee */}
                    <div className="mt-4 flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        {heroDoctor?.consultationFee ? (
                          <>
                            <span className="text-[12px] font-semibold text-slate-400">
                              Regular Fee: <s>৳{Number(heroDoctor.fee || 0).toLocaleString()}</s>
                            </span>
                            <span className="text-[12px] font-semibold text-slate-400">
                              Special Promo Fee:{' '}
                              <span className="text-[18px] font-extrabold text-slate-900">
                                ৳{Number(heroDoctor.consultationFee).toLocaleString()}
                              </span>
                            </span>
                          </>
                        ) : (
                          <span className="text-[12px] font-semibold text-slate-400">
                            Consultation Fee:{' '}
                            <span className="text-[18px] font-extrabold text-slate-900">
                              ৳{Number(heroDoctor?.fee || 600).toLocaleString()}
                            </span>
                          </span>
                        )}
                      </div>
                      {heroDoctor?.consultationFee && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10.5px] font-extrabold border border-emerald-100 shrink-0">
                          SAVE 25%
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenConsultation(heroDoctor)}
                      className="mt-4 w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-extrabold transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98]"
                    >
                      Start Instant Video Consultation
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* floating live stats */}
                <div className="flex items-center justify-center gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12px] font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {onlineBadgeText || `${liveCount}+ ${t('doctor.onlineNow')}`}
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-[12px] font-bold text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    ~4 Min Wait
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ============ HERO STATS BAND ============ */}
        <section className="bg-white border-y border-slate-100">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 py-7">
            <div className="grid grid-cols-3 gap-4 text-center">
              {heroStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col items-center gap-1 ${
                    i > 0 ? 'border-l border-slate-100' : ''
                  }`}
                >
                  <span className="text-[24px] lg:text-[30px] font-extrabold text-slate-900 tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-[11px] lg:text-[12.5px] font-bold uppercase tracking-widest text-slate-400">
                    {s.labelKey ? t(s.labelKey) : s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TRUST BADGES ============ */}
        <section className="bg-white py-7">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 md:divide-x md:divide-slate-100">
              {TRUST_BADGES.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.label}
                    className="flex items-center gap-2.5 px-6 py-2 text-[13px] font-extrabold text-slate-800"
                  >
                    <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </span>
                    {b.label}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ SERVICE GATEWAYS ============ */}
        <section className="bg-slate-50/70 py-14">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {SERVICE_CARDS.map((card) => {
                const Icon = card.icon;
                return (
                  <a
                    key={card.title}
                    href={card.href}
                    className="group bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`w-12 h-12 rounded-2xl ${card.iconWrap} ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6" />
                      </span>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-[16.5px] font-extrabold text-slate-900">{card.title}</h3>
                      <p className="text-[13px] leading-relaxed text-slate-500">{card.desc}</p>
                    </div>
                    <span className={`text-[13px] font-extrabold ${card.color} mt-auto`}>
                      {card.cta} →
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ LIVE DOCTORS ============ */}
        <section id="doctors" className="bg-white py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Specialists
                </span>
                <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                  Consult Certified BMDC Doctors
                </h2>
                <p className="text-[14px] text-slate-500">
                  Showing {visibleRoster.length} doctors available for video consultation today —
                  avg. response under 4 minutes.
                </p>
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-bold border transition-all ${
                    onlineOnly
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      onlineOnly ? 'bg-emerald-300 animate-pulse' : 'bg-slate-300'
                    }`}
                  />
                  Online Now Only
                </button>

                <div className="flex items-center gap-1 bg-slate-100 rounded-full p-1">
                  {(['all', 'female', 'male'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderFilter(g)}
                      className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all ${
                        genderFilter === g
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <label className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-slate-500">
                  Sort:
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-100 border border-slate-200 rounded-full text-[12.5px] font-bold text-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="rating">Top Rated</option>
                    <option value="consulted">Most Consulted</option>
                    <option value="fee">Lowest Fee</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Doctor grid */}
            {visibleRoster.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                {visibleRoster.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onBookClick={() => handleOpenConsultation(doc)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-14 px-6 text-center rounded-3xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  No doctors match the current filters
                </h3>
                <p className="text-[13px] text-slate-500 max-w-sm mx-auto">
                  Try switching off “Online Now Only” or resetting the gender filter to see the
                  full verified directory.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOnlineOnly(false);
                    setGenderFilter('all');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Directory CTA */}
            <div className="flex items-center justify-center pt-1">
              <Link
                href="/department/all"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white text-[14px] font-extrabold transition-all"
              >
                Browse All 2,500+ Verified Doctors
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============ SPECIALTIES ============ */}
        <section id="specialties" className="bg-slate-50/70 py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-9">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                  30+ Medical Departments
                </span>
                <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                  {deptTab === 'departments' ? t('specialties.titleDepartments') : t('specialties.titleSymptoms')}
                </h2>
                <p className="text-[14px] text-slate-500 max-w-xl">
                  {deptTab === 'departments'
                    ? t('specialties.subtitleDepartments')
                    : t('specialties.subtitleSymptoms')}
                </p>
              </div>
              {/* Toggle Tabs: [Departments] [Symptoms] */}
              <div className="flex items-center gap-1.5 self-start md:self-auto bg-white border border-slate-200 rounded-full p-1 shadow-sm">
                {([
                  { key: 'departments', label: t('specialties.tabDepartments') },
                  { key: 'symptoms', label: t('specialties.tabSymptoms') },
                ] as const).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setDeptTab(tab.key)}
                    className={`px-5 py-2 rounded-full text-[13px] font-extrabold transition-all ${
                      deptTab === tab.key
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                        : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {deptTab === 'departments' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4">
              {(cmsDepartments.length > 0
                ? cmsDepartments
                : DEPARTMENTS.map((d) => ({ id: d.slug, title: d.name, slug: d.slug, icon: d.icon, subtitle: null }))
              ).map((dept: any) => {
                const Icon =
                  typeof dept.icon === 'string'
                    ? DEPT_ICON_MAP[dept.icon] || Stethoscope
                    : dept.icon || Stethoscope;
                return (
                  <button
                    key={dept.id || dept.slug}
                    type="button"
                    onClick={() => handleSymptomClick(dept.slug)}
                    className="group bg-white rounded-3xl border border-slate-200/80 p-5 flex flex-col items-start gap-3 text-left shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300"
                  >
                    <span className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5.5 h-5.5" />
                    </span>
                    <span className="text-[13.5px] font-extrabold text-slate-800 leading-snug group-hover:text-blue-700 transition-colors">
                      {dept.title || dept.name}
                    </span>
                    {dept.subtitle && (
                      <span className="text-[11.5px] text-slate-500 leading-snug">{dept.subtitle}</span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {specialtyCounts[dept.slug] !== undefined && specialtyCounts[dept.slug] > 0
                        ? `${specialtyCounts[dept.slug]} ${t('specialties.specialistsAvailable')}`
                        : t('specialties.doctorsAvailable')}
                    </span>
                  </button>
                );
              })}
            </div>
            ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 lg:gap-4">
              {(cmsSymptoms.length > 0
                ? cmsSymptoms
                : POPULAR_SYMPTOMS.map((s) => ({ id: s.slug, title: s.label, slug: s.slug, image: null, departmentSlug: s.slug }))
              ).map((symptom: any) => (
                <button
                  key={symptom.id || symptom.slug}
                  type="button"
                  onClick={() => handleSymptomClick(symptom.departmentSlug || symptom.slug)}
                  className="group bg-blue-50 hover:bg-blue-100 rounded-3xl border border-blue-100/80 overflow-hidden flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300"
                >
                  <div className="w-full aspect-[4/3] flex items-center justify-center overflow-hidden">
                    {symptom.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={symptom.image}
                        alt={symptom.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="w-16 h-16 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Stethoscope className="w-7 h-7" />
                      </span>
                    )}
                  </div>
                  <span className="w-full px-3 py-3.5 text-[13px] font-extrabold text-slate-700 group-hover:text-blue-700 bg-blue-50/60 group-hover:bg-blue-100/80 transition-colors border-t border-blue-100/70">
                    {symptom.title}
                  </span>
                </button>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* ============ PHARMACY / MEDICINE DELIVERY ============ */}
        <section id="medicine" className="bg-white py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-9">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </span>
                  CityDoctor Express Pharmacy
                </span>
                <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                  Genuine Medicines Delivered in 2-4 Hours
                </h2>
                <p className="text-[14px] text-slate-500 max-w-2xl">
                  Get flat 10% discount on every order. Sourced directly from certified
                  pharmaceutical manufacturers like Beximco, Square, Incepta & Renata.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11.5px] font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Genuine Guaranteed
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11.5px] font-extrabold">
                    <Truck className="w-3.5 h-3.5" /> Free Delivery over ৳500
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-[11.5px] font-extrabold">
                    <Zap className="w-3.5 h-3.5" /> Use Code: CITYDOCTOR10
                  </span>
                </div>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-extrabold text-blue-600 hover:text-blue-700 transition-colors w-fit group/shop"
                >
                  Browse Full Medicine Shop
                  <ArrowRight className="w-3.5 h-3.5 group-hover/shop:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Upload prescription banner */}
              <div className="w-full lg:w-[380px] shrink-0 rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-500 p-6 text-white shadow-xl shadow-blue-600/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-widest text-blue-100">
                      <FileText className="w-4 h-4" />
                      Have a Doctor&rsquo;s Prescription?
                    </span>
                    <p className="text-[12.5px] leading-relaxed text-blue-50">
                      Simply upload a photo of your prescription. Our licensed pharmacist will
                      verify medicines and deliver directly to your address.
                    </p>
                  </div>
                  <span className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </span>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-full bg-white text-blue-700 text-[13px] font-extrabold hover:bg-blue-50 transition-colors"
                >
                  Upload Prescription
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-2">
              {productCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setProductCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[12.5px] font-bold border transition-all ${
                    productCategory === cat
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {medicineItems
                .filter((m) => productCategory === 'All' || m.cat === productCategory)
                .map((m) => {
                  const added = getQty(String(m.id || m.name)) > 0;
                  const onSale = Number(m.oldPrice || 0) > Number(m.price || 0);
                  return (
                    <div
                      key={`${m.id || ''}-${m.name}`}
                      className="group relative bg-white rounded-3xl border border-slate-200/80 p-4 flex flex-col gap-3 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 transition-all duration-300"
                    >
                      {onSale && m.oldPrice > 0 && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-extrabold border border-red-100 z-10">
                          {Math.round((1 - m.price / m.oldPrice) * 100)}% OFF
                        </span>
                      )}
                      {m.image ? (
                        <div className="relative h-24 rounded-2xl overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.image}
                            alt={m.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div
                          className={`relative h-24 rounded-2xl ${m.tile} flex items-center justify-center overflow-hidden`}
                        >
                          <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),transparent_50%)]" />
                          <Pill className="w-10 h-10 rotate-[-35deg]" strokeWidth={1.6} />
                          <span className="absolute bottom-2 left-2 text-[10px] font-extrabold uppercase tracking-wide opacity-70">
                            {m.cat}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-[15px] font-extrabold text-slate-900 truncate">
                            {m.name}
                          </h3>
                        </div>
                        <p className="text-[11.5px] text-slate-500 leading-snug truncate">
                          {m.comp}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10.5px] text-slate-400 font-semibold truncate">
                            {m.brand}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9.5px] font-bold text-slate-500 uppercase shrink-0">
                            {m.form}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-[17px] font-extrabold text-slate-900">
                            ৳{m.price}
                          </span>
                          {onSale && (
                            <span className="text-[11.5px] text-slate-400 line-through font-semibold">
                              ৳{m.oldPrice}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => addMedicineToCart(m)}
                          className={`px-3 py-1.5 rounded-full text-[11.5px] font-extrabold border transition-all ${
                            added
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                              : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {added ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* ============ DIAGNOSTICS ============ */}
        <section id="diagnostic" className="bg-slate-50/70 py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-9">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                  <Microscope className="w-4 h-4" />
                  Home Diagnostic Services
                </span>
                <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                  Accredited Lab Tests with Home Sample Collection
                </h2>
                <p className="text-[14px] text-slate-500 max-w-2xl">
                  Certified medical phlebotomist collects blood and urine samples from your
                  doorstep. 100% sterile equipment with digital reports in 24 hours.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11.5px] font-extrabold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Free Sample Collection
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11.5px] font-extrabold">
                    <BadgeCheck className="w-3.5 h-3.5" /> Accredited Lab Results
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              {labPackItems.map((pack) => (
                <div
                  key={pack.id || pack.name}
                  className={`relative bg-white rounded-3xl border p-6 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${
                    pack.popular ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200/80'
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-600 text-white text-[10.5px] font-extrabold uppercase tracking-wide shadow-md shadow-blue-600/30">
                      <Star className="w-3 h-3 fill-white" /> Most Popular
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[17px] font-extrabold text-slate-900 leading-snug">
                        {pack.name}
                      </h3>
                      <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-bold text-slate-600">
                        <FlaskConical className="w-3 h-3" /> {pack.meta}
                      </span>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Microscope className="w-5 h-5" />
                    </span>
                  </div>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600">
                    {pack.tag}
                  </p>
                  <div className="flex flex-col gap-1.5 text-[12.5px] text-slate-500">
                    {(pack.features && pack.features.length
                      ? pack.features
                      : [
                          'Free sample collection from your home',
                          'NABL-accredited partner laboratories',
                          'Digital report delivered within 24 hours',
                        ]
                    ).map((f: string) => (
                      <span key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3 mt-auto border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[22px] font-extrabold text-slate-900">
                        ৳{pack.price.toLocaleString()}
                      </span>
                      {pack.oldPrice > pack.price && (
                        <span className="text-[13px] text-slate-400 line-through font-semibold">
                          ৳{pack.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenConsultation()}
                      className="px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-extrabold transition-colors shadow-md shadow-blue-600/20"
                    >
                      Book Home Collection
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ MEMBERSHIP PLANS ============ */}
        <section id="health-plans" className="bg-white py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-9">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-extrabold uppercase tracking-widest text-blue-700">
                <HeartPulse className="w-3.5 h-3.5" /> Membership
              </span>
              <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                CityDoctor Health Membership Plans
              </h2>
              <p className="text-[14px] text-slate-500 max-w-2xl">
                Protect your entire family with unlimited 24/7 doctor consultations, free medicine
                delivery, and exclusive lab discounts.
              </p>

              {/* Billing toggle */}
              <div className="mt-1 inline-flex items-center gap-2 bg-slate-100 rounded-full p-1.5">
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`px-4 py-2 rounded-full text-[13px] font-extrabold transition-all ${
                    billing === 'monthly'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('yearly')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-extrabold transition-all ${
                    billing === 'yearly'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Yearly
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch pt-2">

              {planItems.map((plan) => {
                const monthly =
                  plan.monthly || Math.round(plan.yearly / 9.6 / 10) * 10;
                const price = billing === 'yearly' ? plan.yearly : monthly;
                return (
                  <div
                    key={plan.id || plan.name}
                    className={`relative flex flex-col rounded-3xl p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                      plan.popular
                        ? 'bg-gradient-to-b from-blue-700 to-blue-900 text-white lg:scale-[1.04] shadow-2xl shadow-blue-700/25 z-10'
                        : 'bg-white border border-slate-200/80 hover:border-blue-200'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[10.5px] font-extrabold uppercase tracking-wider text-white shadow-lg shadow-amber-500/30 whitespace-nowrap">
                        <Star className="w-3 h-3 fill-white" /> Most Popular Choice
                      </span>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-[18px] font-extrabold leading-snug ${
                          plan.popular ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-extrabold shrink-0 ${
                          plan.popular
                            ? 'bg-white/15 text-white border border-white/20'
                            : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}
                      >
                        <Users className="w-3 h-3" /> {plan.members} Member{plan.members > 1 ? 's' : ''}
                      </span>
                    </div>
                    <p
                      className={`text-[12.5px] mt-1 leading-snug ${
                        plan.popular ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {plan.tagline}
                    </p>

                    <div className="mt-5 flex items-baseline gap-1.5">
                      <span
                        className={`text-[34px] font-extrabold tracking-tight ${
                          plan.popular ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        ৳{price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[13px] font-semibold ${
                          plan.popular ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        /{billing === 'yearly' ? 'year' : 'month'}
                      </span>
                      {billing === 'yearly' && (
                        <span
                          className={`ml-1 text-[11px] font-bold ${
                            plan.popular ? 'text-emerald-300' : 'text-emerald-600'
                          }`}
                        >
                          ~৳{monthly}/mo
                        </span>
                      )}
                    </div>

                    <div className={`my-5 h-px ${plan.popular ? 'bg-white/15' : 'bg-slate-100'}`} />
                    <ul className="flex flex-col gap-2.5 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                              plan.popular
                                ? 'bg-emerald-400/20 text-emerald-300'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                          <span
                            className={`text-[12.5px] leading-relaxed ${
                              plan.popular ? 'text-blue-50' : 'text-slate-600'
                            }`}
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleOpenConsultation()}
                      className={`mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full text-[13.5px] font-extrabold transition-all active:scale-[0.98] ${
                        plan.popular
                          ? 'bg-white text-blue-700 hover:bg-blue-50 shadow-lg'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                      }`}
                    >
                      Choose This Plan
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how-it-works" className="bg-gradient-to-b from-blue-50/60 via-white to-white py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                Simple &amp; Effortless
              </span>
              <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                How CityDoctor Telehealth Works
              </h2>
              <p className="text-[14px] text-slate-500 max-w-2xl">
                Complete healthcare support in just a few clicks without waiting in crowded clinic
                queues.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.no}
                    className="relative bg-white rounded-3xl border border-slate-200/80 p-6 pt-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/25">
                        <Icon className="w-5.5 h-5.5" />
                      </span>
                      <span className="text-[44px] font-black text-slate-100 leading-none">
                        {step.no}
                      </span>
                    </div>
                    <h3 className="mt-4 text-[15.5px] font-extrabold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-500">
                      {step.desc}
                    </p>
                    {i < STEPS.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-5 -translate-y-1/2 w-4 h-4 text-slate-300 z-10" />
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        </section>

        {/* ============ WHY CHOOSE US / TRUST ============ */}
        <section className="bg-slate-50/70 py-16 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TRUST_FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white rounded-3xl border border-slate-200/80 p-7 flex flex-col gap-4 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </span>
                    <h3 className="text-[17px] font-extrabold text-slate-900">{f.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 flex flex-col gap-10">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                Verified Patient Experiences
              </span>
              <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                Loved by Over 500,000+ Patients
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="bg-slate-50/70 border border-slate-100 rounded-3xl p-7 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < (t.rating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <blockquote className="text-[14px] leading-relaxed text-slate-600 flex-1">
                    {t.quote}
                  </blockquote>
                  <figcaption className="flex items-center gap-3 pt-4 border-t border-slate-200/70">
                    <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                      {t.name.charAt(0)}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[13.5px] font-extrabold text-slate-900">{t.name}</span>
                      <span className="text-[11px] text-slate-400 font-semibold">{t.place}</span>
                    </div>
                    <BadgeCheck className="w-4.5 h-4.5 text-blue-600 ml-auto shrink-0" />
                  </figcaption>
                </figure>
              ))}

            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faqs" className="bg-slate-50/70 py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[900px] mx-auto px-4 lg:px-6 flex flex-col gap-9">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-[11.5px] font-extrabold uppercase tracking-widest text-blue-600">
                Got Questions?
              </span>
              <h2 className="text-[30px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {FAQS.map((item, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div
                    key={item.q}
                    className={`bg-white rounded-3xl border shadow-sm transition-all overflow-hidden ${
                      isOpen ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-200/80'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="text-[15px] font-extrabold text-slate-800 leading-snug">
                        {item.q}
                      </span>
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          isOpen
                            ? 'bg-blue-600 text-white rotate-180'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 -mt-1 text-[13.5px] leading-relaxed text-slate-500">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ APP DOWNLOAD BANNER ============ */}
        <section id="app" className="bg-white py-16 lg:py-20 scroll-mt-36">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6">
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-800 via-blue-700 to-sky-600 px-8 py-12 lg:px-16 lg:py-14 text-white flex flex-col lg:flex-row lg:items-center gap-10 shadow-2xl shadow-blue-700/25">
              <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
              <div className="pointer-events-none absolute -bottom-28 left-1/3 w-72 h-72 bg-sky-400/20 rounded-full blur-2xl" />
              <div className="relative flex-1 flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 w-fit px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-extrabold uppercase tracking-widest">
                  <Smartphone className="w-3.5 h-3.5" /> Mobile App
                </span>
                <h2 className="text-[28px] lg:text-[38px] font-extrabold tracking-tight leading-tight">
                  Get the CityDoctor App on Your Smartphone
                </h2>
                <p className="text-[14.5px] leading-relaxed text-blue-100 max-w-xl">
                  Access 24/7 doctors, store health records, and order medicines anywhere in
                  Bangladesh.
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-3 bg-slate-900 hover:bg-slate-950 rounded-2xl px-5 py-3 text-white border border-white/10 transition-colors"
                >
                  <span className="text-[22px] leading-none">▶</span>
                  <span className="flex flex-col text-left">
                    <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wider">
                      Available On
                    </span>
                    <span className="text-[14px] font-extrabold">Google Play</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-3 bg-slate-900 hover:bg-slate-950 rounded-2xl px-5 py-3 text-white border border-white/10 transition-colors"
                >
                  <span className="text-[22px] leading-none">🍎</span>
                  <span className="flex flex-col text-left">
                    <span className="text-[9.5px] font-bold text-slate-300 uppercase tracking-wider">
                      Download On The
                    </span>
                    <span className="text-[14px] font-extrabold">App Store</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer className="bg-[#0a1d45] text-blue-100/80">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
              {/* Brand */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                    <Activity className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-[19px] font-extrabold text-white tracking-tight">
                      City<span className="text-blue-400">Doctor</span>
                    </span>
                    <span className="text-[10px] text-blue-300/70 font-semibold mt-1">
                      {t('hero.badge', 'Healthcare in 10 Minutes')}
                    </span>
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-blue-100/70 max-w-sm">
                  CityDoctor is Bangladesh&rsquo;s pioneering digital telehealth ecosystem bringing
                  verified medical care, prescription medicine delivery, and home diagnostic
                  pathology within everyone&rsquo;s reach.
                </p>
                <div className="flex flex-col gap-2 text-[12.5px] font-semibold text-blue-100/80 mt-1">
                  <a href="tel:+8809612345678" className="inline-flex items-center gap-2 hover:text-white transition-colors w-fit">
                    <PhoneCall className="w-4 h-4 text-blue-400" /> 24/7 Hotline: 09612-345678
                  </a>
                  <a href="mailto:care@citydoctor.com" className="inline-flex items-center gap-2 hover:text-white transition-colors w-fit">
                    <Mail className="w-4 h-4 text-blue-400" /> care@citydoctor.com
                  </a>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400" /> Gulshan-1, Dhaka-1212, Bangladesh
                  </span>
                </div>
              </div>

              {/* Our services */}
              <div className="lg:col-span-2 flex flex-col gap-3">
                <h4 className="text-[12px] font-extrabold uppercase tracking-widest text-white mb-2">
                  Our Services
                </h4>
                <a href="#doctors" className="text-[13px] hover:text-white transition-colors">Online Doctor Video Call</a>
                <a href="#medicine" className="text-[13px] hover:text-white transition-colors">Doorstep Medicine (10% Off)</a>
                <a href="#diagnostic" className="text-[13px] hover:text-white transition-colors">Home Sample Collection</a>
                <a href="#health-plans" className="text-[13px] hover:text-white transition-colors">Family Health Subscriptions</a>
                <a href="#specialties" className="text-[13px] hover:text-white transition-colors">Specialist Appointments</a>
              </div>

              {/* Professionals & trust */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <h4 className="text-[12px] font-extrabold uppercase tracking-widest text-white mb-2">
                  Professionals &amp; Trust
                </h4>
                <Link href="/department/general-physician" className="text-[13px] hover:text-white transition-colors">General Physician (Medicine)</Link>
                <Link href="/department/gynae-obs" className="text-[13px] hover:text-white transition-colors">Gynaecology &amp; Pregnancy</Link>
                <Link href="/department/pediatrics" className="text-[13px] hover:text-white transition-colors">Pediatrics (Child Health)</Link>
                <Link href="/department/dermatology" className="text-[13px] hover:text-white transition-colors">Dermatology (Skin &amp; Hair)</Link>
                <Link href="/department/cardiology" className="text-[13px] hover:text-white transition-colors">Cardiology &amp; Heart Care</Link>
                <Link href="/department/psychiatry" className="text-[13px] hover:text-white transition-colors">Psychiatry &amp; Mental Health</Link>
              </div>

              {/* Compliance */}
              <div className="lg:col-span-3 flex flex-col gap-3">
                <h4 className="text-[12px] font-extrabold uppercase tracking-widest text-white mb-2">
                  Privacy &amp; Compliance
                </h4>
                <a href="#" className="text-[13px] hover:text-white transition-colors">Privacy &amp; HIPAA Security</a>
                <a href="#" className="text-[13px] hover:text-white transition-colors">Terms of Consultation</a>
                <a href="#" className="text-[13px] hover:text-white transition-colors">Prescription Verification</a>
                <a href="#" className="text-[13px] hover:text-white transition-colors">Corporate Health Coverage</a>
                <div className="flex items-center gap-2 mt-3 px-3.5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[12px] font-semibold w-fit">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  BMDC Certified Doctors Only
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-12 rounded-2xl bg-white/[0.04] border border-white/10 px-5 py-4">
              <p className="text-[11.5px] leading-relaxed text-blue-100/60">
                <span className="font-extrabold text-blue-100/90">Medical Disclaimer:</span>{' '}
                CityDoctor provides digital telemedicine consultation for primary and non-emergency
                health conditions. If you or a family member are experiencing a life-threatening
                medical emergency (such as severe chest pain, acute respiratory arrest, active
                bleeding, or loss of consciousness), please dial 999 immediately or proceed to the
                nearest hospital emergency room.
              </p>
            </div>

            {/* Bottom */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
              <p className="text-[12px] text-blue-100/60">
                {t('footer.rights')}
              </p>
              <p className="text-[12px] font-semibold text-blue-100/70">
                DGHS Registered <span className="text-emerald-400">•</span> BMDC Compliant{' '}
                <span className="text-emerald-400">•</span> SSL Secured Gateway
              </p>
            </div>
          </div>
        </footer>
      </main>





















      {/* ==================== DOCTOR TIME-SLOT SELECTION MODAL ====================
          Slot-first booking: no payment UI is shown here. After a date + time
          is confirmed the BookingModal routes to /checkout for payment. */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setBookingDoctor(null);
        }}
        doctor={bookingDoctor}
      />
    </div>
  );
}
