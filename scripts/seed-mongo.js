/**
 * scripts/seed-mongo.js — Plain JavaScript seed for MongoDB Atlas.
 *
 * Inserts / upserts the initial dataset into the MongoDB Atlas database that
 * `DATABASE_URL` in `.env` points to:
 *   - Doctors, including Prof. Dr. Safayet Hossain under Cardiology.
 *   - Department labels (UI taxonomy — seeded automatically only if a
 *     Department Prisma model is ever added).
 *   - Weekly shift schedules so bookable time slots appear immediately.
 *   - Default Admin + Patient accounts.
 *
 * Every write is an idempotent upsert (keyed on unique email / phone / name),
 * so running the script more than once is safe.
 *
 * Run from the project root:
 *   node scripts/seed-mongo.js
 *
 * (Plain CommonJS on purpose — no ts-node / tsx required.)
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

// ---------------------------------------------------------------------------
// Environment — standalone `node` does not read `.env`, so load DATABASE_URL.
// ---------------------------------------------------------------------------

function loadEnvFile() {
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

/** Strip credentials from a Mongo URL before printing it. */
function sanitizeUrl(url) {
  return String(url || 'DATABASE_URL (env)').replace(/\/\/([^:]+):[^@]+@/, '//***:***@');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Hash a plaintext password exactly like lib/auth.ts (scrypt "salt:hash").
 * Used for the demo doctor / patient login accounts (password123).
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/** Optional text columns: empty strings become null. */
function optionalText(value) {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s === '' ? null : s;
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** Weekly schedule defaults applied to every doctor unless overridden. */
const DEFAULT_SCHEDULE = {
  availableDays: 'Sat, Sun, Mon, Tue', // comma-separated booking days
  shiftStartTime: '10:00', // 24h format
  shiftEndTime: '18:00',
  slotDuration: 15, // minutes per patient
  maxPatientsPerSlot: 1,
  vatPercent: 5,
  platformFee: 29,
  doctorCommissionPercent: 80,
  isInstantCallAvailable: true,
  isOnVacation: false,
};

/** Default Admin account (the Admin model stores no password). */
const DEFAULT_ADMIN = {
  name: 'Dr. Alexander King',
  email: 'admin@doctime.com',
  role: 'SUPERADMIN',
};

/** Default Patient (demo identity — sign in with john.smith@example.com /
 *  password123, or by phone through the phone-based flow). */
const DEFAULT_PATIENTS = [
  {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+880 1711-234567',
    location: 'Dhaka',
    age: 34,
    gender: 'Male',
    login: true, // demo patient login (email / password123)
  },
];

/** Initial doctors mirroring the previous local setup. Email-less local rows
 *  (Maya, Nusrat) get a deterministic unique address — MongoDB's @unique email
 *  index allows only ONE null email, while SQLite allowed several. They stay
 *  password-less (no login), exactly like the local setup. */
const DOCTORS = [
  {
    name: 'Prof. Dr. Safayet Hossain',
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
    login: true, // demo doctor login (email / password123)
    image: 'https://ctgmhpl.com/backend/assets/images/uploads/doctor/single/dr-a-m-safayet-hossain_single.png',
    bio: 'Specialist in preventative cardiology, hypertension management, echocardiography, and non-invasive cardiovascular diagnostics.',
    badge: 'Top Rated Cardiologist',
    isOnline: true,
    status: 'ONLINE',
    // Evening/night shift (21:00 → 13:00 crosses midnight) — supported by the
    // booking engine (see components/BookingModal.tsx / lib/timeSlot.ts).
    availableDays: 'Sun, Mon, Tue',
    shiftStartTime: '21:00',
    shiftEndTime: '13:00',
    slotDuration: 30,
    maxPatientsPerSlot: 2,
    platformFee: 65,
    doctorCommissionPercent: 100,
    bmdcRegNum: 'A-10000/2019',
  },
  {
    name: 'Dr. Marcus Vance',
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
    login: true, // demo doctor login (email / password123)
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    bio: 'Expert in clinical dermatology, adult acne, psoriasis, suspicious mole screening, and allergy-induced rashes.',
    badge: 'Super Fast Response',
    isOnline: true,
    status: 'ONLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 15,
    bmdcRegNum: 'A-10173/2020',
  },
  {
    name: 'Dr. Elena Rostova',
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
    login: true, // demo doctor login (email / password123)
    image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
    bio: 'Comprehensive primary health care, acute viral illnesses, metabolic health, preventative wellness, and chronic disease management.',
    badge: 'DocTime Gold Choice',
    isOnline: true,
    status: 'ONLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 20,
    bmdcRegNum: 'A-10346/2021',
  },
  {
    name: 'Dr. David Chen',
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
    login: true, // demo doctor login (email / password123)
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    bio: 'Specialized diagnostic workups for migraines, chronic neuropathic pain, memory disorders, and post-concussion recovery.',
    badge: 'Research Lead',
    isOnline: false,
    status: 'OFFLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 30,
    bmdcRegNum: 'A-10519/2022',
  },
  {
    name: 'Dr. Maya Patel',
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
    email: 'doc-maya-patel@citydoctor.com', // derived — no login (no password)
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
    bio: 'Compassionate pediatric care, infant nutrition, childhood developmental milestones, and acute respiratory infections.',
    badge: 'Child Care Expert',
    isOnline: true,
    status: 'ONLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 15,
    bmdcRegNum: 'A-10692/2023',
  },
  {
    name: 'Dr. Amara Okafor',
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
    login: true, // demo doctor login (email / password123)
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
    bio: 'Musculoskeletal pain triage, sports injury evaluations, joint stiffness, ergonomic workplace assessments, and posture correction.',
    badge: 'Sports Medicine',
    isOnline: false,
    status: 'OFFLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '14:00',
    shiftEndTime: '22:00',
    slotDuration: 10,
    bmdcRegNum: 'A-10865/2019',
  },
  {
    name: 'Dr. Nusrat Zahan',
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
    email: 'doc-nusrat-zahan@citydoctor.com', // derived — no login (no password)
    image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
    bio: 'Comprehensive gynecological care, prenatal screening, fertility counseling, menstrual disorders, and postnatal care.',
    badge: "Women's Health Expert",
    isOnline: true,
    status: 'ONLINE',
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 20,
    bmdcRegNum: 'A-11038/2020',
  },
];

// ---------------------------------------------------------------------------
// Upsert helpers — idempotent, keyed on unique email / phone / name
// ---------------------------------------------------------------------------

async function findDoctorByEmailOrName(email, name) {
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

async function findPatientByIdentifiers(email, phone, name) {
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

async function findAdminByEmail(email) {
  try {
    return await prisma.admin.findUnique({ where: { email } });
  } catch {
    return prisma.admin.findFirst({ where: { email } });
  }
}

/** Drop undefined/null values so optional unique fields are simply omitted. */
function compact(data) {
  const out = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined && data[key] !== null) out[key] = data[key];
  }
  return out;
}

async function upsertDoctors(doctors, doctorPasswordHash) {
  let created = 0;
  let updated = 0;
  for (const row of doctors) {
    // Merge default weekly shift availability, then override with the
    // doctor-specific schedule (so slots appear on the main site immediately).
    const data = compact({
      ...DEFAULT_SCHEDULE,
      ...row,
      password: row.login ? doctorPasswordHash : undefined,
    });
    delete data.login;

    const existing = await findDoctorByEmailOrName(data.email, data.name);
    if (existing) {
      await prisma.doctor.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.doctor.create({ data });
      created += 1;
    }
  }
  console.log(`[doctors] ${created} created, ${updated} updated.`);
}

async function upsertPatients(patients, passwordHash) {
  let created = 0;
  let updated = 0;
  for (const row of patients) {
    const data = compact({
      ...row,
      password: row.login ? passwordHash : undefined,
    });
    delete data.login;

    const existing = await findPatientByIdentifiers(data.email, data.phone, data.name);
    if (existing) {
      await prisma.patient.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.patient.create({ data });
      created += 1;
    }
  }
  console.log(`[patients] ${created} created, ${updated} updated.`);
}

async function upsertAdmin(admin) {
  const data = compact(admin);
  const existing = await findAdminByEmail(data.email);
  if (existing) {
    await prisma.admin.update({ where: { id: existing.id }, data });
    console.log(`[admin] Updated ${data.email} (${data.role}).`);
  } else {
    await prisma.admin.create({ data });
    console.log(`[admin] Created ${data.email} (${data.role}).`);
  }
}

// ---------------------------------------------------------------------------
// Departments (UI taxonomy — no Department Prisma model yet)
// ---------------------------------------------------------------------------

/** Distinct doctor specialties (Safayet ⇒ Cardiology always included). */
function departmentLabels() {
  const labels = new Set(['Cardiology']);
  for (const doctor of DOCTORS) {
    const label = doctor.specialty ? String(doctor.specialty).trim() : '';
    if (label) labels.add(label);
  }
  return Array.from(labels).sort();
}

/** Seeds departments if a model is ever added; otherwise reports the labels. */
async function seedDepartments() {
  const labels = departmentLabels();
  const delegate = prisma.department;
  if (!delegate || typeof delegate.upsert !== 'function') {
    console.log(
      `[departments] Skipped — no Department model in prisma/schema.prisma. ` +
        `${labels.length} labels: ${labels.join(', ')}`
    );
    return;
  }
  for (const name of labels) {
    await delegate.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`[departments] ${labels.length} departments upserted.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function seed() {
  console.log(`[seed] Seeding MongoDB Atlas (${sanitizeUrl(process.env.DATABASE_URL)})...`);
  const doctorPasswordHash = hashPassword('password123'); // demo doctor password

  await upsertDoctors(DOCTORS, doctorPasswordHash);
  await upsertPatients(DEFAULT_PATIENTS, doctorPasswordHash);
  await upsertAdmin(DEFAULT_ADMIN);
  await seedDepartments();

  console.log('Data seeded successfully');
}

seed()
  .catch((err) => {
    console.error('\nSeed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


