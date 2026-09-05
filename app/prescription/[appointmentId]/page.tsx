'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Activity,
  Loader2,
  Printer,
  Download,
  ArrowLeft,
  Stethoscope,
  Pill,
  FlaskConical,
  HeartPulse,
  Calendar,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

function PrescriptionContent() {
  const params = useParams();
  const appointmentId = (params?.appointmentId as string) || '';

  const [prescription, setPrescription] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadPrescription() {
      if (!appointmentId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/prescriptions?appointmentId=${appointmentId}`);
        const data = await res.json();
        if (isMounted) {
          setPrescription(data.success ? data.prescription : null);
        }
      } catch {
        if (isMounted) setPrescription(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadPrescription();
    return () => {
      isMounted = false;
    };
  }, [appointmentId]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading prescription...</p>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h1 className="font-bold text-lg text-slate-800">Prescription Not Available</h1>
        <p className="text-sm text-slate-500 max-w-sm">
          The doctor has not submitted a prescription for this appointment yet.
        </p>
        <Link
          href="/"
          className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const appt = prescription.appointment || {};
  const doc = appt.doctor || {};
  const medList = (prescription.medicines || '')
    .split('\n')
    .map((m: string) => m.trim())
    .filter(Boolean);
  const testList = (prescription.tests || '')
    .split('\n')
    .map((t: string) => t.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 print:hidden">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-black text-slate-900">CityDoctor Prescription</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Home
            </Link>
          </div>
        </div>
      </div>

      {/* Prescription paper */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          {/* Letterhead */}
          <div className="bg-blue-700 text-white px-8 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-blue-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-lg leading-tight">CityDoctor Telehealth</div>
                <div className="text-[11px] text-blue-100">
                  BMDC Verified Online Consultation • 24/7
                </div>
              </div>
            </div>
            <div className="text-right text-[11px] text-blue-100">
              <div className="font-bold text-white">Digital Prescription</div>
              <div className="font-mono">RX-{prescription.id.slice(-8).toUpperCase()}</div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Doctor & Patient info */}
            <div className="grid grid-cols-2 gap-4 text-sm border-b border-dashed border-slate-300 pb-5">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Physician
                </div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  {prescription.doctorName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {doc.specialty || 'Specialist'} • {doc.hospital || 'CityDoctor Telehealth'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                  Patient
                </div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {prescription.patientName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                  {appt.patientPhone && <span>{appt.patientPhone}</span>}
                  {appt.patientLocation && <span>{appt.patientLocation}</span>}
                </div>
              </div>
            </div>


            {/* Date */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Prescribed: {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              {appt.timeSlot && <span className="inline-flex items-center gap-1.5">Slot: {appt.timeSlot}</span>}
            </div>

            {/* Diagnosis */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="text-[10px] uppercase tracking-wider text-blue-500 font-bold mb-1 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5" /> Diagnosis
              </div>
              <p className="font-semibold text-slate-900">{prescription.diagnosis}</p>
            </div>

            {/* Medicines */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-blue-600" /> Medicines
              </div>
              <ol className="space-y-2">
                {medList.map((med: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-slate-800">{med}</span>
                  </li>
                ))}
              </ol>
            </div>


            {/* Tests & Advice */}
            <div className="grid sm:grid-cols-2 gap-4">
              {testList.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-teal-600" /> Suggested Tests
                  </div>
                  <ul className="space-y-1">
                    {testList.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-1.5">
                        <span className="text-teal-600 font-black">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {prescription.advice && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600" /> Advice &amp; Follow-up
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {prescription.advice}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-dashed border-slate-300 pt-4 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified digital prescription from CityDoctor Telehealth
              </span>
              <span className="font-bold text-slate-500">
                Dr. {prescription.doctorName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PrescriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Loading prescription...</p>
        </div>
      }
    >
      <PrescriptionContent />
    </Suspense>
  );
}

