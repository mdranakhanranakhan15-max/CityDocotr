/**
 * Local (SQLite) → MongoDB Atlas data migration.
 *
 * Reads the previous local dataset — Doctors (e.g. "Prof. Dr. Safayet Hossain"),
 * Patients, Appointments and Department labels — from the legacy SQLite file
 * `prisma/dev.db` (via `better-sqlite3` when available). If the file is missing,
 * empty, or no SQLite driver is installed, it falls back to the same built-in
 * records the app was previously seeded with so the MongoDB Atlas database
 * (DATABASE_URL in `.env`) still ends up populated with demo data.
 *
 * Prisma model note: Doctor/Patient/Appointment ids are `@db.ObjectId` on
 * MongoDB, so the legacy cuid-style ids CANNOT be reused as `_id`. Every legacy
 * record is inserted fresh with a generated ObjectId and the old -> new id map
 * is used to re-link Appointment.doctorId / Appointment.patientId.
 *
 * Run from the project root:
 *   npx tsx scripts/migrate-to-mongodb.ts
 *   # or, if ts-node is installed instead of tsx:
 *   npx ts-node scripts/migrate-to-mongodb.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

/** Fields that exist on the Mongo Doctor model (safe to write). */
const DOCTOR_FIELDS = [
  'name', 'title', 'designation', 'degrees', 'specialty', 'specialties',
  'workplace', 'hospital', 'education', 'experienceYears', 'rating',
  'totalVisits', 'reviewsCount', 'fee', 'consultationFee', 'email', 'password',
  'isOnline', 'status', 'image', 'languages', 'bio', 'badge', 'isVerified',
  'departmentSlug', 'isApproved',
  'availableDays', 'shiftStartTime', 'shiftEndTime', 'slotDuration',
  'maxPatientsPerSlot', 'vatPercent', 'platformFee', 'doctorCommissionPercent',
  'bmdcRegNum', 'isInstantCallAvailable', 'isOnVacation',
];

/** Fields that exist on the Mongo Patient model. */
const PATIENT_FIELDS = [
  'name', 'email', 'phone', 'location', 'password', 'resetOtp',
  'resetOtpExpiresAt', 'age', 'gender',
];

/** Fields that exist on the Mongo Appointment model. */
const APPOINTMENT_FIELDS = [
  'patientName', 'patientEmail', 'patientPhone', 'patientLocation', 'timeSlot',
  'symptoms', 'status', 'paymentStatus', 'paymentMethod', 'transactionId',
  'amountPaid', 'scheduledAt', 'meetingLink', 'notes',
];

/** Schedule / slot defaults previously applied when seeding doctors. */
const SCHEDULE_DEFAULTS = {
  availableDays: 'Sat, Sun, Mon, Tue',
  shiftStartTime: '10:00',
  shiftEndTime: '18:00',
  slotDuration: 15,
  maxPatientsPerSlot: 1,
  vatPercent: 5,
  platformFee: 29,
  doctorCommissionPercent: 80,
  isInstantCallAvailable: true,
  isOnVacation: false,
};

const toNum = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toBool = (v: any, fallback = false): boolean => {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
  return Boolean(v);
};

/** "Cardiology" -> "cardiology"; "Gynae & Obs" -> "gynae-obs". */
const slugify = (value: any): string =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Keep only schema-safe fields, dropping undefined / null values. */
const pick = (obj: any, fields: string[]): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const key of fields) {
    const v = obj?.[key];
    if (v !== undefined && v !== null) out[key] = v;
  }
  return out;
};

// ---------------------------------------------------------------------------
// 1. Legacy source data
// ---------------------------------------------------------------------------

/** Fallback demo records used when the local SQLite file is not readable. */
function buildFallbackData() {
  const doctorPasswordHash = hashPassword('password123');

  const doctors = [
    {
      id: 'doc-safayet-hossain',
      name: 'Prof. Dr. Safayet Hossain',
      email: 'prof.safayet.hossain@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Professor & Senior Consultant (Cardiology)',
      degrees: 'MBBS, FCPS (Medicine), MD (Cardiology), FACC',
      specialty: 'Cardiology',
      specialties: 'Cardiology, Hypertension, Preventative Heart Care',
      workplace: 'National Institute of Cardiovascular Diseases (NICVD)',
      hospital: 'National Institute of Cardiovascular Diseases (NICVD)',
      education: 'Dhaka Medical College',
      experienceYears: 16,
      fee: 450,
      consultationFee: 450,
      rating: 5.0,
      totalVisits: 3283,
      reviewsCount: 412,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Specialist in preventative cardiology, hypertension management, echocardiography, and non-invasive cardiovascular diagnostics.',
      badge: 'Top Rated Cardiologist',
      isVerified: true,
      bmdcRegNum: 'A-10500/21',
    },
    {
      id: 'doc-farhana-rahman',
      name: 'Dr. Farhana Rahman',
      email: 'doc-farhana-rahman@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Consultant Obstetrician & Gynecologist',
      degrees: 'MBBS, FCPS (Obs & Gynae), MS',
      specialty: 'Gynae & Obs',
      specialties: 'Gynecology, Obstetrics, Infertility & High-Risk Pregnancy',
      workplace: 'BIRDEM General Hospital & Maternal Center',
      hospital: 'BIRDEM General Hospital & Maternal Center',
      education: 'Dhaka Medical College',
      experienceYears: 13,
      fee: 400,
      consultationFee: 400,
      rating: 5.0,
      totalVisits: 3740,
      reviewsCount: 460,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Comprehensive gynecological care, prenatal screening, fertility counseling, menstrual disorders, and postnatal care.',
      badge: "Women's Health Expert",
      isVerified: true,
      bmdcRegNum: 'A-11193/23',
    },
    {
      id: 'doc-nadia-karim',
      name: 'Dr. Nadia Karim',
      email: 'doc-nadia-karim@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Senior Consultant (Pediatrics)',
      degrees: 'MBBS, DCH, FCPS (Pediatrics)',
      specialty: 'Pediatrics',
      specialties: 'Pediatrics, Neonatology, Child Nutrition',
      workplace: 'Bangabandhu Sheikh Mujib Medical University',
      hospital: 'Bangabandhu Sheikh Mujib Medical University',
      education: 'Dhaka Medical College',
      experienceYears: 11,
      fee: 350,
      consultationFee: 350,
      rating: 4.9,
      totalVisits: 2415,
      reviewsCount: 301,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Child health specialist focused on newborn care, immunisation, growth monitoring, and common childhood illnesses.',
      badge: 'Child Care Expert',
      isVerified: true,
      bmdcRegNum: 'A-12780/22',
    },
  ];

  const patients = [
    {
      id: 'patient-john-smith',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+880 1711-234567',
      location: 'Dhaka',
      age: 34,
      gender: 'Male',
    },
  ];

  // Sample appointment ~3 minutes from now so the demo dashboard shows the
  // "Join Consultation Room" action (available 5 minutes before the slot).
  const demoSlotDate = new Date(Date.now() + 1000 * 60 * 3);
  const appointments = [
    {
      id: 'appt-demo-001',
      doctorLegacyId: 'doc-safayet-hossain',
      patientLegacyId: 'patient-john-smith',
      patientName: 'John Smith',
      patientEmail: 'john.smith@example.com',
      patientPhone: '+880 1711-234567',
      symptoms: 'Mild chest pressure after jogging and elevated blood pressure reading (135/88).',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'BKASH',
      transactionId: 'TRX-BKASH-8923',
      amountPaid: 450,
      timeSlot: `${demoSlotDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • ${demoSlotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      scheduledAt: demoSlotDate,
      notes: 'Initial cardiac consultation. Patient has ECG records from last year.',
    },
  ];

  const departments = [
    'General Physician', 'Cardiology', 'Dermatology', 'Pediatrics',
    'Gynae & Obs', 'Neurology', 'Orthopedics', 'Internal Medicine',
    'Endocrinology', 'Eye & ENT',
  ];

  return { doctors, patients, appointments, departments };
}

// ---------------------------------------------------------------------------
// 2. Load legacy records (SQLite dev.db first, mock fallback otherwise)
// ---------------------------------------------------------------------------

interface LegacyDataSet {
  source: string;
  doctors: Record<string, any>[];
  patients: Record<string, any>[];
  appointments: Record<string, any>[];
  departments: string[];
}

async function readLegacySqlite(): Promise<LegacyDataSet | null> {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!fs.existsSync(dbPath)) return null;

  try {
    // better-sqlite3 is NOT a hard dependency — try it so existing local data
    // can be read; when absent the mock fallback below is used instead.
    // @ts-ignore -- optional runtime dependency, installed by the user if needed
    const mod: any = await import('better-sqlite3');
    const Sqlite = mod.default || mod;
    const db = new Sqlite(dbPath, { readonly: true });

    const hasTable = (table: string): boolean =>
      Boolean(
        db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name = ?"
          )
          .get(table)
      );
    const rowsOf = (table: string): Record<string, any>[] =>
      hasTable(table)
        ? (db.prepare(`SELECT * FROM "${table}"`).all() as Record<string, any>[])
        : [];

    const data: LegacyDataSet = {
      source: `SQLite (${path.basename(dbPath)})`,
      doctors: rowsOf('Doctor'),
      patients: rowsOf('Patient'),
      appointments: rowsOf('Appointment'),
      departments: [],
    };
    db.close();

    if (data.doctors.length === 0 && data.patients.length === 0) return null;
    return data;
  } catch (err) {
    console.warn(
      '[migrate] Could not read SQLite dev.db with better-sqlite3 — ' +
        `falling back to mock records. (${(err as Error)?.message ?? err})`
    );
    return null;
  }
}

function normalizeLegacyDoctor(raw: Record<string, any>): Record<string, any> {
  return {
    ...raw,
    legacyId: raw.id || raw.legacyId || `doc-fallback-${Date.now()}`,
    id: undefined, // never write the old cuid-style id as Mongo _id
    name: raw.name || 'Unknown Doctor',
    email: raw.email || null,
    image: raw.image || FALLBACK_IMAGE,
    designation: raw.designation || 'Consultant',
    specialty: raw.specialty || 'General Physician',
    availableDays: raw.availableDays || SCHEDULE_DEFAULTS.availableDays,
    shiftStartTime: raw.shiftStartTime || SCHEDULE_DEFAULTS.shiftStartTime,
    shiftEndTime: raw.shiftEndTime || SCHEDULE_DEFAULTS.shiftEndTime,
    slotDuration: toNum(raw.slotDuration, 15),
    maxPatientsPerSlot: toNum(raw.maxPatientsPerSlot, 1),
    isOnline: toBool(raw.isOnline, true),
    isVerified: toBool(raw.isVerified, true),
    departmentSlug: raw.departmentSlug || slugify(raw.specialty || ''),
    isApproved: toBool(raw.isApproved, true),
    status: 'ACTIVE', // imported doctors are always approved/listed; isOnline tracks live presence
    isInstantCallAvailable: toBool(raw.isInstantCallAvailable, true),
    isOnVacation: toBool(raw.isOnVacation, false),
  };
}

function normalizeLegacyPatient(raw: Record<string, any>): Record<string, any> {
  return {
    ...raw,
    legacyId: raw.id || raw.legacyId || `patient-fallback-${Date.now()}`,
    id: undefined,
    name: raw.name || 'Unknown Patient',
    email: raw.email || null,
    phone: raw.phone || null,
  };
}

/** Build a fresh Mongo-safe Date; corrupted legacy timestamps fall back to now. */
function toSafeDate(value: any, fallbackMs = Date.now()): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date(fallbackMs) : d;
}

function normalizeLegacyAppointment(
  raw: Record<string, any>
): Record<string, any> {
  return {
    ...raw,
    legacyId: raw.id || raw.legacyId || `appt-fallback-${Date.now()}`,
    id: undefined,
    doctorLegacyId:
      raw.doctorLegacyId || raw.doctorId || (raw as any).doctor_id || '',
    patientLegacyId:
      raw.patientLegacyId || raw.patientId || (raw as any).patient_id || null,
    patientName: raw.patientName || 'Patient',
    symptoms: raw.symptoms || 'General Online Consultation',
    scheduledAt: toSafeDate(raw.scheduledAt, Date.now() + 1000 * 60 * 3),
  };
}

async function loadLegacyData(): Promise<LegacyDataSet> {
  const sqlite = await readLegacySqlite();
  if (sqlite) return sqlite;

  console.warn(
    '[migrate] prisma/dev.db not found (or not readable) — using built-in ' +
      'mock records as the previous local dataset.'
  );
  const fallback = buildFallbackData();
  return {
    source: 'Mock fallback arrays',
    doctors: fallback.doctors,
    patients: fallback.patients,
    appointments: fallback.appointments,
    departments: fallback.departments,
  };
}

// ---------------------------------------------------------------------------
// 3. Upsert into MongoDB Atlas through Prisma Client
// ---------------------------------------------------------------------------

function buildDoctorWriteData(doc: Record<string, any>): Record<string, any> {
  const data: Record<string, any> = {
    ...SCHEDULE_DEFAULTS,
    ...pick(doc, DOCTOR_FIELDS),
  };
  // Coerce numeric fields to numbers (SQLite may hand back strings/integers).
  for (const key of [
    'experienceYears', 'rating', 'totalVisits', 'reviewsCount', 'fee',
    'consultationFee', 'slotDuration', 'maxPatientsPerSlot', 'vatPercent',
    'platformFee', 'doctorCommissionPercent',
  ]) {
    if (data[key] !== undefined) {
      data[key] = toNum(data[key], key === 'rating' ? 5 : 0);
    }
  }
  for (const key of ['isOnline', 'isVerified', 'isInstantCallAvailable', 'isOnVacation']) {
    if (data[key] !== undefined) data[key] = toBool(data[key], true);
  }
  return data;
}

function buildPatientWriteData(pat: Record<string, any>): Record<string, any> {
  const data: Record<string, any> = pick(pat, PATIENT_FIELDS);
  if (data.age !== undefined) data.age = toNum(data.age, 0) || null;
  return data;
}

/** Upsert doctors keyed on unique email (fallback: name). Returns old->new id map. */
async function upsertDoctors(
  legacyDoctors: Record<string, any>[]
): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const raw of legacyDoctors) {
    const doc = normalizeLegacyDoctor(raw);
    const data = buildDoctorWriteData(doc);

    let existing: any = null;
    if (doc.email) {
      existing = await prisma.doctor.findUnique({ where: { email: doc.email } });
    }
    if (!existing) {
      existing = await prisma.doctor.findFirst({ where: { name: doc.name } });
    }

    if (existing) {
      await prisma.doctor.update({ where: { id: existing.id }, data });
      updated += 1;
      idMap.set(doc.legacyId, existing.id);
    } else {
      const createdDoc = await prisma.doctor.create({ data: data as any });
      created += 1;
      idMap.set(doc.legacyId, createdDoc.id);
    }
  }

  console.log(`[doctors] ${created} created, ${updated} updated in MongoDB.`);
  return idMap;
}

/** Upsert patients keyed on unique email / phone (fallback: name). */
async function upsertPatients(
  legacyPatients: Record<string, any>[]
): Promise<Map<string, string>> {
  const idMap = new Map<string, string>();
  let created = 0;
  let updated = 0;

  for (const raw of legacyPatients) {
    const pat = normalizeLegacyPatient(raw);
    const data = buildPatientWriteData(pat);

    let existing: any = null;
    if (pat.email) {
      existing = await prisma.patient.findUnique({ where: { email: pat.email } });
    }
    if (!existing && pat.phone) {
      existing = await prisma.patient.findUnique({ where: { phone: pat.phone } });
    }
    if (!existing) {
      existing = await prisma.patient.findFirst({ where: { name: pat.name } });
    }

    if (existing) {
      await prisma.patient.update({ where: { id: existing.id }, data });
      updated += 1;
      idMap.set(pat.legacyId, existing.id);
    } else {
      const createdPatient = await prisma.patient.create({ data: data as any });
      created += 1;
      idMap.set(pat.legacyId, createdPatient.id);
    }
  }

  console.log(`[patients] ${created} created, ${updated} updated in MongoDB.`);
  return idMap;
}

/** Insert appointments, remapping legacy doctor/patient ids to Mongo ObjectIds. */
async function upsertAppointments(
  legacyAppointments: Record<string, any>[],
  doctorIdMap: Map<string, string>,
  patientIdMap: Map<string, string>
): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const raw of legacyAppointments) {
    const appt = normalizeLegacyAppointment(raw);
    const newDoctorId = doctorIdMap.get(appt.doctorLegacyId);
    if (!newDoctorId) {
      skipped += 1;
      console.warn(
        `[appointments] Skipped "${appt.patientName}" — no matching legacy doctor ` +
          `for reference "${appt.doctorLegacyId}".`
      );
      continue;
    }

    const data: Record<string, any> = {
      ...pick(appt, APPOINTMENT_FIELDS),
      doctorId: newDoctorId,
      patientId: patientIdMap.get(appt.patientLegacyId) ?? null,
      scheduledAt: toSafeDate(appt.scheduledAt),
    };
    if (data.amountPaid !== undefined) data.amountPaid = toNum(data.amountPaid, 0);

    // Idempotency guard — appointments have no natural unique key, so match on
    // transaction id when present, otherwise on the patient + slot combination.
    let existing: any = null;
    if (data.transactionId) {
      existing = await prisma.appointment.findFirst({
        where: { transactionId: data.transactionId },
      });
    }
    if (!existing && data.patientPhone && data.timeSlot) {
      existing = await prisma.appointment.findFirst({
        where: { patientPhone: data.patientPhone, timeSlot: data.timeSlot },
      });
    }

    if (existing) {
      await prisma.appointment.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      const apptDoc = await prisma.appointment.create({
        data: { ...data, meetingLink: null } as any,
      });
      // Point the meeting link at the real appointment id.
      await prisma.appointment.update({
        where: { id: apptDoc.id },
        data: { meetingLink: `/consultation/${apptDoc.id}` },
      });
      created += 1;
    }
  }

  console.log(
    `[appointments] ${created} created, ${updated} updated, ${skipped} skipped in MongoDB.`
  );
}

/**
 * Departments are a UI taxonomy in this app (no Department Prisma model yet).
 * If a model is added later this block seeds it automatically; otherwise it
 * simply reports the preserved labels.
 */
async function migrateDepartments(names: string[]): Promise<void> {
  if (!names.length) return;
  const delegate: any = (prisma as any).department;
  if (!delegate || typeof delegate.upsert !== 'function') {
    console.log(
      `[departments] Skipped — no Department model in prisma/schema.prisma. ` +
        `${names.length} labels preserved for reference: ${names.join(', ')}`
    );
    return;
  }
  let count = 0;
  for (const name of names) {
    await delegate.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    count += 1;
  }
  console.log(`[departments] ${count} departments upserted in MongoDB.`);
}

// ---------------------------------------------------------------------------
// 4. Run
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(
    '[migrate] Local → MongoDB data migration (Prisma Client → ' +
      (process.env.DATABASE_URL || 'DATABASE_URL env')
      .replace(/\/\/([^:]+):[^@]+@/, '//***:***@') + ')'
  );

  const data = await loadLegacyData();
  console.log(
    `[migrate] Source: ${data.source} — ` +
      `${data.doctors.length} doctors, ${data.patients.length} patients, ` +
      `${data.appointments.length} appointments, ${data.departments.length} departments.`
  );

  const doctorIdMap = await upsertDoctors(data.doctors);
  const patientIdMap = await upsertPatients(data.patients);
  await upsertAppointments(data.appointments, doctorIdMap, patientIdMap);
  await migrateDepartments(data.departments);

  console.log('\n[migrate] Done ✔ — data is now in the MongoDB Atlas database.');
}

main()
  .catch((err) => {
    console.error('\n[migrate] Migration failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
