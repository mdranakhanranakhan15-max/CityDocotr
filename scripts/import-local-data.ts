/**
 * Local (SQLite) → MongoDB Atlas import.
 *
 * Populates MongoDB Atlas (`DATABASE_URL` in `.env`) with the exact Doctors,
 * Departments and user records (Patients + Admin) from the previous local
 * setup (`prisma/dev.db`, a SQLite database) using @prisma/client.
 *
 * Source selection
 * ----------------
 * 1. If `prisma/dev.db` exists it is read (better-sqlite3 when installed,
 *    then the `sqlite3` CLI in JSON mode) and every record is imported
 *    faithfully (idempotent upsert keyed on unique email / phone / name).
 * 2. If the file is missing / unreadable / empty the script falls back to an
 *    embedded mirror of the same local records so Atlas still ends up
 *    populated with demo data.
 *
 * Guarantees (always enforced, idempotent)
 * ----------------------------------------
 * - "Prof. Dr. Safayet Hossain" exists under Cardiology with working login
 *   credentials (drsfayet@citydoctor.com / password123 — same hash as local).
 * - Default Admin record exists: admin@doctime.com / Dr. Alexander King /
 *   SUPERADMIN. (The Admin model stores no password in prisma/schema.prisma,
 *   so the admin credential is the Admin row itself.)
 * - Default Patient record exists: John Smith (john.smith@example.com /
 *   +880 1711-234567 / 34 / Male) — the demo identity the booking flow uses.
 * - Every doctor is saved with a valid weekly shift (availableDays + shift
 *   window + slotDuration) so bookable slots appear on the main site
 *   immediately. Schedule defaults are applied ONLY when a local value is
 *   missing or unusable; exact local values (incl. overnight shifts such as
 *   Safayet's 21:00 → 13:00) are preserved.
 *
 * Department note: departments are a UI taxonomy without a Prisma model yet
 * (see scripts/migrate-to-mongodb.ts). Labels come from the doctors' distinct
 * `specialty` values and are upserted automatically if a Department model is
 * added later; otherwise they are reported in the console only.
 *
 * Run from the project root:
 *   npm run db:import
 *   # or directly: npx tsx scripts/import-local-data.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';
import { parseTimeToMinutes, parseAvailableDays } from '../lib/timeSlot';

// ---------------------------------------------------------------------------
// Environment / Prisma
// ---------------------------------------------------------------------------

/** Minimal .env loader — standalone ts-node / tsx does not read .env itself. */
function loadEnvFile(): void {
  if (process.env.DATABASE_URL) return;
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* non-fatal — DATABASE_URL may already be exported in the shell */
  }
}
loadEnvFile();

const prisma = new PrismaClient();

/** Print the target Mongo URL without leaking credentials. */
const sanitizeUrl = (url?: string): string =>
  (url || 'DATABASE_URL (env)').replace(/\/\/([^:]+):[^@]+@/, '//***:***@');

// ---------------------------------------------------------------------------
// Schema-safe field lists & shared defaults
// ---------------------------------------------------------------------------

/** Schedule / shift defaults previously used when seeding doctors. */
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

/** Fields that exist on the Mongo Doctor model (safe to write). */
const DOCTOR_FIELDS = [
  'name', 'title', 'designation', 'degrees', 'specialty', 'specialties',
  'workplace', 'hospital', 'education', 'experienceYears', 'rating',
  'totalVisits', 'reviewsCount', 'fee', 'consultationFee', 'email', 'password',
  'isOnline', 'status', 'image', 'languages', 'bio', 'badge', 'isVerified',
  'availableDays', 'shiftStartTime', 'shiftEndTime', 'slotDuration',
  'maxPatientsPerSlot', 'vatPercent', 'platformFee', 'doctorCommissionPercent',
  'bmdcRegNum', 'isInstantCallAvailable', 'isOnVacation',
];

/** Fields that exist on the Mongo Patient model. */
const PATIENT_FIELDS = [
  'name', 'email', 'phone', 'location', 'password', 'resetOtp',
  'resetOtpExpiresAt', 'age', 'gender',
];

/** Fields that exist on the Mongo Admin model. */
const ADMIN_FIELDS = ['name', 'email', 'role'];

/** Default Admin credentials (the Admin model stores no password). */
const DEFAULT_ADMIN = {
  name: 'Dr. Alexander King',
  email: 'admin@doctime.com',
  role: 'SUPERADMIN',
};

/** Default Patient credentials used by the booking/demo flow. */
const DEFAULT_PATIENT = {
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+880 1711-234567',
  age: 34,
  gender: 'Male',
};

/** Cardiology doctor that must always exist on the main site. */
const SAFEYET_EMAIL = 'drsfayet@citydoctor.com';
const SAFEYET_NAME = 'Prof. Dr. Safayet Hossain';

// ---------------------------------------------------------------------------
// Coercion helpers (SQLite hands back numbers / strings / 0|1 booleans)
// ---------------------------------------------------------------------------

const toNum = (v: unknown, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const toBool = (v: unknown, fallback = false): boolean => {
  if (v === undefined || v === null) return fallback;
  if (typeof v === 'string') return v.toLowerCase() === 'true' || v === '1';
  return Boolean(v);
};

/** Optional text columns: empty strings become null so Mongo unique indexes
 *  (email / phone) are not violated by multiple '' values. */
const optionalText = (v: unknown): string | null => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

/** Keep only schema-safe fields, dropping undefined / null values. */
const pick = (obj: Record<string, any>, fields: string[]): Record<string, any> => {
  const out: Record<string, any> = {};
  for (const key of fields) {
    const v = obj?.[key];
    if (v !== undefined && v !== null) out[key] = v;
  }
  return out;
};

/** Guard so every doctor ends up with a schedule the booking UI can render. */
function ensureBookableSchedule(data: Record<string, any>): Record<string, any> {
  if (parseAvailableDays(data.availableDays).length === 0) {
    data.availableDays = SCHEDULE_DEFAULTS.availableDays;
  }
  const start = parseTimeToMinutes(data.shiftStartTime);
  const end = parseTimeToMinutes(data.shiftEndTime);
  if (start === null || end === null || start === end) {
    data.shiftStartTime = SCHEDULE_DEFAULTS.shiftStartTime;
    data.shiftEndTime = SCHEDULE_DEFAULTS.shiftEndTime;
  }
  if (!(toNum(data.slotDuration) > 0)) data.slotDuration = SCHEDULE_DEFAULTS.slotDuration;
  if (!(toNum(data.maxPatientsPerSlot) > 0)) {
    data.maxPatientsPerSlot = SCHEDULE_DEFAULTS.maxPatientsPerSlot;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Built-in mirror of the exact Doctor rows found in the local setup
// (prisma/dev.db). Used only when that file is missing or unreadable.
// Password hashes are filled by buildFallbackData() for rows that carry an
// email — the local hash verifies against "password123".
// ---------------------------------------------------------------------------

const FALLBACK_DOCTORS: Array<Record<string, any>> = [
  {
    name: 'Prof. Dr. Safayet Hossain',
    title: 'Consultant',
    designation: 'Senior Consultant & Head of Cardiology',
    degrees: 'MBBS, D-Card',
    specialty: 'Cardiology',
    specialties: 'Cardiology (Heart Diseases) and Medicine',
    workplace: 'City Hospital, Hospital Road, Maizdee, Noakhali Sadar, Noakhali, Bangladesh.',
    hospital: 'City Hospital, Hospital Road, Maizdee, Noakhali Sadar, Noakhali, Bangladesh.',
    education: 'Dhaka Medical College',
    experienceYears: 14,
    rating: 5.0,
    totalVisits: 100,
    reviewsCount: 412,
    fee: 700,
    consultationFee: 700.0,
    email: 'drsfayet@citydoctor.com',
    isOnline: true,
    status: 'ONLINE',
    image: 'https://ctgmhpl.com/backend/assets/images/uploads/doctor/single/dr-a-m-safayet-hossain_single.png',
    languages: 'English, Bengali',
    bio: 'Specialist in preventative cardiology, hypertension management, echocardiography, and non-invasive cardiovascular diagnostics.',
    badge: 'Top Rated Cardiologist',
    isVerified: true,
    availableDays: 'Sun, Mon, Tue',
    shiftStartTime: '21:00',
    shiftEndTime: '13:00',
    slotDuration: 30,
    maxPatientsPerSlot: 2,
    vatPercent: 5,
    platformFee: 65,
    doctorCommissionPercent: 100,
    bmdcRegNum: 'A-10000/2019',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. Marcus Vance',
    title: 'Consultant',
    designation: 'Associate Professor (Dermatology & Venereology)',
    degrees: 'MBBS, DDV, FCPS (Dermatology)',
    specialty: 'Dermatology',
    specialties: 'Dermatology, Skin Allergy, Laser & Cosmetic Care',
    workplace: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    hospital: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
    education: 'Sir Salimullah Medical College',
    experienceYears: 11,
    rating: 4.9,
    totalVisits: 2410,
    reviewsCount: 318,
    fee: 350,
    consultationFee: 350.0,
    email: 'doc-marcus-vance@citydoctor.com',
    isOnline: true,
    status: 'ONLINE',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Expert in clinical dermatology, adult acne, psoriasis, suspicious mole screening, and allergy-induced rashes.',
    badge: 'Super Fast Response',
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 15,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-10173/2020',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. Elena Rostova',
    title: 'Consultant',
    designation: 'Consultant - Medicine & Family Health',
    degrees: 'MBBS, BCS (Health), FCPS (Internal Medicine)',
    specialty: 'General Physician',
    specialties: 'General Physician, Internal Medicine, Family Care',
    workplace: 'Dhaka Medical College Hospital',
    hospital: 'Dhaka Medical College Hospital',
    education: 'Dhaka Medical College',
    experienceYears: 16,
    rating: 5.0,
    totalVisits: 5820,
    reviewsCount: 624,
    fee: 320,
    consultationFee: 320.0,
    email: 'doc-elena-rostova@citydoctor.com',
    isOnline: true,
    status: 'ONLINE',
    image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Comprehensive primary health care, acute viral illnesses, metabolic health, preventative wellness, and chronic disease management.',
    badge: 'DocTime Gold Choice',
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 20,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-10346/2021',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. David Chen',
    title: 'Consultant',
    designation: 'Assistant Professor (Neurology)',
    degrees: 'MBBS, MD (Neurology), MACP (USA)',
    specialty: 'Neurology',
    specialties: 'Neurology, Headache, Stroke & Nerve Disorders',
    workplace: 'National Institute of Neurosciences & Hospital (NINS)',
    hospital: 'National Institute of Neurosciences & Hospital (NINS)',
    education: 'Mymensingh Medical College',
    experienceYears: 18,
    rating: 4.9,
    totalVisits: 1890,
    reviewsCount: 198,
    fee: 500,
    consultationFee: 500.0,
    email: 'doc-david-chen@citydoctor.com',
    isOnline: false,
    status: 'OFFLINE',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Specialized diagnostic workups for migraines, chronic neuropathic pain, memory disorders, and post-concussion recovery.',
    badge: 'Research Lead',
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 30,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-10519/2022',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. Maya Patel',
    title: 'Consultant',
    designation: 'Consultant Pediatrician & Neonatologist',
    degrees: 'MBBS, DCH, FCPS (Pediatrics)',
    specialty: 'Pediatrics',
    specialties: 'Pediatrics, Neonatal Care, Child Nutrition & Growth',
    workplace: 'Dhaka Shishu (Children) Hospital',
    hospital: 'Dhaka Shishu (Children) Hospital',
    education: 'Chittagong Medical College',
    experienceYears: 9,
    rating: 5.0,
    totalVisits: 4120,
    reviewsCount: 510,
    fee: 350,
    consultationFee: 350.0,
    isOnline: true,
    status: 'ONLINE',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Compassionate pediatric care, infant nutrition, childhood developmental milestones, and acute respiratory infections.',
    badge: 'Child Care Expert',
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 15,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-10692/2023',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. Amara Okafor',
    title: 'Consultant',
    designation: 'Assistant Professor (Orthopedics & Trauma)',
    degrees: 'MBBS, MS (Orthopedic Surgery)',
    specialty: 'Orthopedics',
    specialties: 'Orthopedic Surgery, Joint Pain, Arthritis & Sports Injury',
    workplace: 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)',
    hospital: 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)',
    education: 'Rajshahi Medical College',
    experienceYears: 12,
    rating: 4.8,
    totalVisits: 2190,
    reviewsCount: 230,
    fee: 400,
    consultationFee: 400.0,
    email: 'doc-amara-okafor@citydoctor.com',
    isOnline: false,
    status: 'OFFLINE',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Musculoskeletal pain triage, sports injury evaluations, joint stiffness, ergonomic workplace assessments, and posture correction.',
    badge: 'Sports Medicine',
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 10,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-10865/2019',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
  {
    name: 'Dr. Nusrat Zahan',
    title: 'Consultant',
    designation: 'Consultant Obstetrician & Gynecologist',
    degrees: 'MBBS, FCPS (Obs & Gynae), MS',
    specialty: 'Gynae & Obs',
    specialties: 'Gynecology, Obstetrics, Infertility & High-Risk Pregnancy',
    workplace: 'BIRDEM General Hospital & Maternal Center',
    hospital: 'BIRDEM General Hospital & Maternal Center',
    education: 'Dhaka Medical College',
    experienceYears: 13,
    rating: 5.0,
    totalVisits: 3740,
    reviewsCount: 460,
    fee: 400,
    consultationFee: 400.0,
    isOnline: true,
    status: 'ONLINE',
    image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
    languages: 'English, Bengali',
    bio: 'Comprehensive gynecological care, prenatal screening, fertility counseling, menstrual disorders, and postnatal care.',
    badge: "Women's Health Expert",
    isVerified: true,
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 20,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    bmdcRegNum: 'A-11038/2020',
    isInstantCallAvailable: true,
    isOnVacation: false,
  },
];

// ---------------------------------------------------------------------------
// 1. Local source data
// ---------------------------------------------------------------------------

interface LegacyDataSet {
  source: string;
  doctors: Record<string, any>[];
  patients: Record<string, any>[];
  admins: Record<string, any>[];
  departments: string[];
}

/** Fallback mirror of the local records — same doctors/admin/patient defaults. */
function buildFallbackData(): LegacyDataSet {
  const doctorPasswordHash = hashPassword('password123');
  const doctors = FALLBACK_DOCTORS.map((row) => {
    const copy = { ...row };
    // Mirror the local setup: only doctors that have an email get a password.
    if (copy.email) copy.password = doctorPasswordHash;
    return copy;
  });
  return {
    source: 'Built-in mirror of prisma/dev.db',
    doctors,
    patients: [{ ...DEFAULT_PATIENT }],
    admins: [{ ...DEFAULT_ADMIN }],
    departments: [],
  };
}

/** Read one table through the sqlite3 CLI in JSON mode. */
function readTableViaSqlite3Cli(dbPath: string, table: string): Record<string, any>[] {
  const stdout = execFileSync(
    'sqlite3',
    ['-json', dbPath, `SELECT * FROM "${table}";`],
    { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
  );
  const trimmed = stdout.trim();
  if (!trimmed) return [];
  return JSON.parse(trimmed) as Record<string, any>[];
}

/** Try the optional better-sqlite3 package first (mirrors migrate script). */
async function tryReadBetterSqlite3(dbPath: string): Promise<LegacyDataSet | null> {
  try {
    // better-sqlite3 is NOT a hard dependency — optional runtime driver.
    // @ts-ignore -- optional dependency; falls back to the sqlite3 CLI below.
    const mod: any = await import('better-sqlite3');
    const Sqlite = mod.default || mod;
    const db = new Sqlite(dbPath, { readonly: true });
    const hasTable = (table: string): boolean =>
      Boolean(
        db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(table)
      );
    const rowsOf = (table: string): Record<string, any>[] =>
      hasTable(table)
        ? (db.prepare(`SELECT * FROM "${table}"`).all() as Record<string, any>[])
        : [];
    const data: LegacyDataSet = {
      source: `SQLite (${path.basename(dbPath)}) via better-sqlite3`,
      doctors: rowsOf('Doctor'),
      patients: rowsOf('Patient'),
      admins: rowsOf('Admin'),
      departments: [],
    };
    db.close();
    return data;
  } catch {
    return null;
  }
}

/** Fall back to the sqlite3 CLI (JSON output) when better-sqlite3 is absent. */
function tryReadSqlite3Cli(dbPath: string): LegacyDataSet | null {
  try {
    return {
      source: `SQLite (${path.basename(dbPath)}) via sqlite3 CLI`,
      doctors: readTableViaSqlite3Cli(dbPath, 'Doctor'),
      patients: readTableViaSqlite3Cli(dbPath, 'Patient'),
      admins: readTableViaSqlite3Cli(dbPath, 'Admin'),
      departments: [],
    };
  } catch {
    return null;
  }
}

/** Locate prisma/dev.db (or equivalent local data) and load it if possible. */
async function readLegacyData(): Promise<LegacyDataSet> {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(dbPath)) {
    console.log(
      `[source] Local data found: prisma/dev.db (${fs.statSync(dbPath).size} bytes).`
    );
    const viaLib = await tryReadBetterSqlite3(dbPath);
    if (viaLib) return viaLib;
    const viaCli = tryReadSqlite3Cli(dbPath);
    if (viaCli) return viaCli;
    console.warn(
      '[source] prisma/dev.db is present but could not be read (no better-sqlite3 ' +
        'and no sqlite3 CLI available) — using the built-in mirror instead.'
    );
  } else {
    console.warn('[source] prisma/dev.db not found — using the built-in mirror of the local setup.');
  }
  return buildFallbackData();
}

// ---------------------------------------------------------------------------
// 2. Normalize legacy rows → Mongo-safe write payloads
// ---------------------------------------------------------------------------

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';

/**
 * Doctor.email is `@unique` on MongoDB, which allows at most ONE document
 * with a missing/null email — while the local SQLite setup stored several
 * email-less doctors (Dr. Maya Patel, Dr. Nusrat Zahan). To keep those exact
 * doctor records side by side, each email-less doctor is given a deterministic,
 * password-less address derived from its legacy id/name (e.g.
 * dr-nusrat-zahan@citydoctor.com). Doctors that do have a local email keep it.
 */
function legacyDoctorEmail(raw: Record<string, any>): string | null {
  const email = optionalText(raw.email);
  if (email) return email;
  const slugSource = String(raw.id || raw.name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slugSource ? `${slugSource}@citydoctor.com` : null;
}

function normalizeLegacyDoctor(raw: Record<string, any>): Record<string, any> {
  return {
    ...raw,
    id: undefined,
    name: (raw.name || '').toString().trim() || 'Unknown Doctor',
    email: legacyDoctorEmail(raw),
    password: optionalText(raw.password),
    image: raw.image || FALLBACK_IMAGE,
    specialty: (raw.specialty || 'General Physician').toString().trim(),
    status: (raw.status || 'ONLINE').toString().trim() || 'ONLINE',
  };
}

function normalizeLegacyPatient(raw: Record<string, any>): Record<string, any> {
  return {
    ...raw,
    id: undefined,
    name: (raw.name || 'Unknown Patient').toString().trim(),
    email: optionalText(raw.email),
    phone: optionalText(raw.phone),
  };
}

function normalizeLegacyAdmin(raw: Record<string, any>): Record<string, any> {
  return {
    ...raw,
    id: undefined,
    name: (raw.name || DEFAULT_ADMIN.name).toString().trim(),
    email: optionalText(raw.email) || DEFAULT_ADMIN.email,
    role: (raw.role || 'SUPERADMIN').toString().trim() || 'SUPERADMIN',
  };
}

/** Build the Mongo Doctor payload, coercing types and guarding the schedule. */
function buildDoctorWriteData(doc: Record<string, any>): Record<string, any> {
  const data: Record<string, any> = {
    ...SCHEDULE_DEFAULTS,
    ...pick(doc, DOCTOR_FIELDS),
  };
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
  return ensureBookableSchedule(data);
}

/** Build the Mongo Patient payload (age is optional → null when 0/absent). */
function buildPatientWriteData(pat: Record<string, any>): Record<string, any> {
  const data = pick(pat, PATIENT_FIELDS);
  if (data.age !== undefined) data.age = toNum(data.age, 0) || null;
  return data;
}

/** Build the Mongo Admin payload (role always defaults to SUPERADMIN). */
function buildAdminWriteData(admin: Record<string, any>): Record<string, any> {
  return pick(admin, ADMIN_FIELDS);
}

// ---------------------------------------------------------------------------
// 3. Upsert into MongoDB Atlas through Prisma Client
// ---------------------------------------------------------------------------

/** Find a doctor by unique email first (name as fallback key). */
async function findDoctorByEmailOrName(
  email?: string | null,
  name?: string | null
): Promise<any | null> {
  if (email) {
    try {
      const hit = await prisma.doctor.findUnique({ where: { email } });
      if (hit) return hit;
    } catch {
      // Older Atlas DBs may lack the unique index — retry with findFirst.
    }
    const viaFirst = await prisma.doctor.findFirst({ where: { email } });
    if (viaFirst) return viaFirst;
  }
  if (name) return prisma.doctor.findFirst({ where: { name } });
  return null;
}

/** Find a patient by unique email, then unique phone, then name. */
async function findPatientByIdentifiers(
  email?: string | null,
  phone?: string | null,
  name?: string | null
): Promise<any | null> {
  if (email) {
    try {
      const hit = await prisma.patient.findUnique({ where: { email } });
      if (hit) return hit;
    } catch {
      /* fall through to findFirst */
    }
    const viaEmail = await prisma.patient.findFirst({ where: { email } });
    if (viaEmail) return viaEmail;
  }
  if (phone) {
    try {
      const hit = await prisma.patient.findUnique({ where: { phone } });
      if (hit) return hit;
    } catch {
      /* fall through to findFirst */
    }
    const viaPhone = await prisma.patient.findFirst({ where: { phone } });
    if (viaPhone) return viaPhone;
  }
  if (name) return prisma.patient.findFirst({ where: { name } });
  return null;
}

/** Find an Admin row by its unique email. */
async function findAdminByEmail(email: string): Promise<any | null> {
  try {
    return await prisma.admin.findUnique({ where: { email } });
  } catch {
    return prisma.admin.findFirst({ where: { email } });
  }
}

async function upsertDoctors(legacyDoctors: Record<string, any>[]): Promise<void> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  for (const raw of legacyDoctors) {
    const doc = normalizeLegacyDoctor(raw);
    if (!doc.name || doc.name === 'Unknown Doctor') {
      skipped += 1;
      console.warn('[doctors] Skipped a legacy row without a usable name.');
      continue;
    }
    const data = buildDoctorWriteData(doc);
    const existing = await findDoctorByEmailOrName(doc.email, doc.name);
    if (existing) {
      await prisma.doctor.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.doctor.create({ data: data as any });
      created += 1;
    }
  }
  console.log(`[doctors] ${created} created, ${updated} updated, ${skipped} skipped in MongoDB.`);
}

async function upsertPatients(legacyPatients: Record<string, any>[]): Promise<void> {
  let created = 0;
  let updated = 0;
  for (const raw of legacyPatients) {
    const pat = normalizeLegacyPatient(raw);
    if (!pat.name || pat.name === 'Unknown Patient') {
      console.warn('[patients] Skipped a legacy row without a usable name.');
      continue;
    }
    const data = buildPatientWriteData(pat);
    const existing = await findPatientByIdentifiers(pat.email, pat.phone, pat.name);
    if (existing) {
      await prisma.patient.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.patient.create({ data: data as any });
      created += 1;
    }
  }
  console.log(`[patients] ${created} created, ${updated} updated in MongoDB.`);
}

async function upsertAdmins(legacyAdmins: Record<string, any>[]): Promise<void> {
  let created = 0;
  let updated = 0;
  for (const raw of legacyAdmins) {
    const admin = normalizeLegacyAdmin(raw);
    const data = buildAdminWriteData(admin);
    const existing = await findAdminByEmail(admin.email);
    if (existing) {
      await prisma.admin.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.admin.create({ data: data as any });
      created += 1;
    }
  }
  console.log(`[admins] ${created} created, ${updated} updated in MongoDB.`);
}

// ---------------------------------------------------------------------------
// 4. Guarantees (always enforced, idempotent)
// ---------------------------------------------------------------------------

/** Case-insensitive word-token check: "Cardiology (Heart...)" contains it. */
const hasToken = (text: string, token: string): boolean =>
  text
    .toLowerCase()
    .split(/[^a-z0-9&]+/)
    .filter(Boolean)
    .includes(token.toLowerCase());

/** Ensure "Prof. Dr. Safayet Hossain" exists under Cardiology. */
async function ensureSafayetCardiologist(): Promise<void> {
  const base = FALLBACK_DOCTORS.find((d) => d.email === SAFEYET_EMAIL) || {};
  const existing = await findDoctorByEmailOrName(SAFEYET_EMAIL, SAFEYET_NAME);

  if (!existing) {
    const data = buildDoctorWriteData({
      ...base,
      name: SAFEYET_NAME,
      email: SAFEYET_EMAIL,
      password: hashPassword('password123'),
    });
    const created = await prisma.doctor.create({ data: data as any });
    console.log(`[ensure] Created "${SAFEYET_NAME}" under Cardiology (id ${created.id}).`);
    return;
  }

  const patch: Record<string, any> = {};
  if (existing.specialty !== 'Cardiology') patch.specialty = 'Cardiology';
  const currentSpecialties = String(existing.specialties || '');
  if (!hasToken(currentSpecialties, 'Cardiology')) {
    patch.specialties = currentSpecialties
      ? `Cardiology, ${currentSpecialties}`
      : 'Cardiology';
  }
  if (Object.keys(patch).length > 0) {
    await prisma.doctor.update({ where: { id: existing.id }, data: patch });
    console.log(`[ensure] "${SAFEYET_NAME}" set under Cardiology (${JSON.stringify(patch)}).`);
  } else {
    console.log(`[ensure] "${SAFEYET_NAME}" is already under Cardiology.`);
  }
}

/** Ensure the default Admin record exists (admin@doctime.com / SUPERADMIN). */
async function ensureDefaultAdmin(): Promise<void> {
  const existing = await findAdminByEmail(DEFAULT_ADMIN.email);
  if (!existing) {
    await prisma.admin.create({ data: { ...DEFAULT_ADMIN } });
    console.log(`[ensure] Default Admin created: ${DEFAULT_ADMIN.email} (${DEFAULT_ADMIN.role}).`);
    return;
  }
  const patch: Record<string, any> = {};
  if ((existing.role || '') !== DEFAULT_ADMIN.role) patch.role = DEFAULT_ADMIN.role;
  if ((existing.name || '') !== DEFAULT_ADMIN.name) patch.name = DEFAULT_ADMIN.name;
  if (Object.keys(patch).length > 0) {
    await prisma.admin.update({ where: { id: existing.id }, data: patch });
    console.log(`[ensure] Default Admin record updated (${JSON.stringify(patch)}).`);
  } else {
    console.log(`[ensure] Default Admin present: ${DEFAULT_ADMIN.email} (${DEFAULT_ADMIN.role}).`);
  }
}

/** Ensure the default Patient record exists (John Smith demo identity). */
async function ensureDefaultPatient(): Promise<void> {
  const existing = await findPatientByIdentifiers(DEFAULT_PATIENT.email, DEFAULT_PATIENT.phone);
  if (existing) {
    console.log(
      `[ensure] Default Patient present: ${DEFAULT_PATIENT.name} (${DEFAULT_PATIENT.email}).`
    );
    return;
  }
  await prisma.patient.create({ data: { ...DEFAULT_PATIENT } });
  console.log(`[ensure] Default Patient created: ${DEFAULT_PATIENT.name} (${DEFAULT_PATIENT.email}).`);
}

/** Department labels = distinct doctor specialties (+ the Cardiology default). */
function collectDepartmentLabels(legacyDoctors: Record<string, any>[]): string[] {
  const labels = new Set<string>();
  for (const d of legacyDoctors) {
    const label = d && d.specialty ? String(d.specialty).trim() : '';
    if (label) labels.add(label);
  }
  labels.add('Cardiology'); // guaranteed by ensureSafayetCardiologist()
  return Array.from(labels).sort();
}

/**
 * Departments are a UI taxonomy with no Prisma model yet — if one is added
 * later this seeds it automatically; otherwise the labels are reported only.
 */
async function migrateDepartments(names: string[]): Promise<void> {
  if (!names.length) return;
  const delegate: any = (prisma as any).department;
  if (!delegate || typeof delegate.upsert !== 'function') {
    console.log(
      `[departments] Skipped — no Department model in prisma/schema.prisma. ` +
        `${names.length} labels preserved: ${names.join(', ')}`
    );
    return;
  }
  let count = 0;
  for (const name of names) {
    await delegate.upsert({ where: { name }, update: {}, create: { name } });
    count += 1;
  }
  console.log(`[departments] ${count} departments upserted in MongoDB.`);
}

// ---------------------------------------------------------------------------
// 5. Run
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(
    '[import] Local → MongoDB Atlas import (Prisma Client → ' +
      sanitizeUrl(process.env.DATABASE_URL) +
      ')'
  );

  const data = await readLegacyData();
  console.log(
    `[import] Source: ${data.source} — ${data.doctors.length} doctors, ` +
      `${data.patients.length} patients, ${data.admins.length} admins.`
  );
  if (!data.doctors.length && !data.patients.length && !data.admins.length) {
    console.warn(
      '[import] Local dataset appears empty — default records are still ensured below.'
    );
  }

  await upsertDoctors(data.doctors);
  await upsertPatients(data.patients);
  await upsertAdmins(data.admins);

  await ensureSafayetCardiologist();
  await ensureDefaultAdmin();
  await ensureDefaultPatient();

  await migrateDepartments(collectDepartmentLabels(data.doctors));

  console.log('\n[import] Done ✔ — local records are now in MongoDB Atlas.');
}

main()
  .catch((err) => {
    console.error('\n[import] Import failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });





