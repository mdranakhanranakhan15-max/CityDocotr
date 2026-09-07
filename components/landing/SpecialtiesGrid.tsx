'use client';

import React from 'react';
import {
  Stethoscope,
  Heart,
  Brain,
  Baby,
  Smile,
  ShieldCheck,
  Sparkles,
  Activity,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface SpecialtiesGridProps {
  onSelectSpecialty: (specialty: string) => void;
}

export const SPECIALTY_ITEMS = [
  {
    id: 'general-physician',
    name: 'General Physician',
    dbName: 'General Physician',
    icon: Activity,
    description: 'Fever, flu, infections, blood pressure & general wellness',
    gradient: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30',
    iconBg: 'bg-teal-500/20 text-teal-400',
  },
  {
    id: 'gynecology',
    name: 'Gynecology & Obstetrics',
    dbName: 'Gynecologist',
    icon: Sparkles,
    description: "Women's health, pregnancy care, periods & fertility triage",
    gradient: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30',
    iconBg: 'bg-pink-500/20 text-pink-400',
  },
  {
    id: 'pediatrics',
    name: 'Pediatrics (Child Care)',
    dbName: 'Pediatrician',
    icon: Baby,
    description: 'Newborn care, infant nutrition, childhood fever & growth',
    gradient: 'from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30',
    iconBg: 'bg-blue-500/20 text-blue-400',
  },
  {
    id: 'dermatology',
    name: 'Dermatology (Skin & Hair)',
    dbName: 'Dermatologist',
    icon: Sparkles,
    description: 'Acne, eczema, fungal infections, rash & hair fall issues',
    gradient: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
    iconBg: 'bg-amber-500/20 text-amber-400',
  },
  {
    id: 'cardiology',
    name: 'Cardiology (Heart Care)',
    dbName: 'Cardiologist',
    icon: Heart,
    description: 'Chest discomfort, hypertension, palpitation & ECG review',
    gradient: 'from-rose-500/20 to-red-500/10 text-rose-300 border-rose-500/30',
    iconBg: 'bg-rose-500/20 text-rose-400',
  },
  {
    id: 'neurology',
    name: 'Neurology (Brain & Nerve)',
    dbName: 'Neurologist',
    icon: Brain,
    description: 'Migraines, vertigo, nerve pain, seizures & memory issues',
    gradient: 'from-purple-500/20 to-violet-500/10 text-purple-300 border-purple-500/30',
    iconBg: 'bg-purple-500/20 text-purple-400',
  },
  {
    id: 'psychiatry',
    name: 'Psychiatry & Counseling',
    dbName: 'Psychiatrist',
    icon: Smile,
    description: 'Anxiety, depression, sleep disorders, stress & mental health',
    gradient: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    iconBg: 'bg-emerald-500/20 text-emerald-400',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedic Surgery',
    dbName: 'Orthopedic Surgeon',
    icon: ShieldCheck,
    description: 'Joint pain, arthritis, back pain, posture & sports injuries',
    gradient: 'from-cyan-500/20 to-sky-500/10 text-cyan-300 border-cyan-500/30',
    iconBg: 'bg-cyan-500/20 text-cyan-400',
  },
];

// Maps this grid's ids to the department slugs returned by /api/specialties.
const COUNT_SLUG: Record<string, string> = {
  'general-physician': 'general-physician',
  gynecology: 'gynae-obs',
  pediatrics: 'pediatrics',
  dermatology: 'dermatology',
  cardiology: 'cardiology',
  neurology: 'neurology',
  psychiatry: 'psychiatry',
  orthopedics: 'orthopedics',
};

export const SpecialtiesGrid: React.FC<SpecialtiesGridProps> = ({
  onSelectSpecialty,
}) => {
  const [doctorCounts, setDoctorCounts] = React.useState<Record<string, number>>({});

  // Fetch real verified-doctor counts per specialty from the database.
  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/specialties')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.counts) {
          setDoctorCounts(data.counts);
        }
      })
      .catch(() => {
        // Keep "Doctors Available" fallback badges when the API is offline.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClick = (dbName: string) => {
    onSelectSpecialty(dbName);
    const docSection = document.getElementById('doctors');
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="specialties" className="py-14 sm:py-20 bg-slate-950 select-none">
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 xl:px-12 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-widest">
              <Stethoscope className="w-4 h-4" />
              <span>Specialist Consultations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Browse by Specialties
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Find verified expert physicians across all major clinical fields. Consult instantly online without waiting in hospital queues.
            </p>
          </div>

          <button
            onClick={() => handleClick('All Specialties')}
            className="text-xs text-teal-400 hover:text-teal-300 font-bold inline-flex items-center gap-1.5 transition-colors self-start md:self-auto"
          >
            <span>View All Doctors</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 8-Card Specialties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 sm:gap-6">
          {SPECIALTY_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleClick(item.dbName)}
                className={`p-5 rounded-2xl bg-gradient-to-br ${item.gradient} bg-slate-900/90 border hover:scale-[1.02] transition-all duration-300 cursor-pointer shadow-lg group flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.iconBg} shadow-inner group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/60 text-slate-300 border border-slate-700/50">
                      {doctorCounts[COUNT_SLUG[item.id]] !== undefined && doctorCounts[COUNT_SLUG[item.id]] > 0
                        ? `${doctorCounts[COUNT_SLUG[item.id]]} Specialists Available`
                        : 'Doctors Available'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-100 group-hover:text-white transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 group-hover:text-teal-300 transition-colors">
                    Consult Specialist
                  </span>
                  <ArrowRight className="w-4 h-4 text-teal-400 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

