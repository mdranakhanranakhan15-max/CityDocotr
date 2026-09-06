import { prisma } from '@/lib/prisma';
import { hashPasswordBcrypt } from '@/lib/auth';

/** "Cardiology" -> "cardiology"; "Gynae & Obs" -> "gynae-obs". */
function toDepartmentSlug(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export class DoctorValidationError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'DoctorValidationError';
    this.status = status;
  }
}

/**
 * Shared "Add New Doctor" business logic used by the Admin Panel.
 * - Validates Full Name / Specialty / Consultation Fee.
 * - Persists the optional portal login credentials (email + phone + password).
 * - Hashes the Initial Password with bcrypt before it ever touches the DB.
 */
export async function createDoctorRecord(body: any) {
  const {
    name,
    designation,
    degrees,
    specialty,
    specialties,
    workplace,
    hospital,
    education,
    experienceYears,
    fee,
    consultationFee,
    isOnline,
    status,
    image,
    bio,
    languages,
    badge,
    rating,
    totalVisits,
    email,
    phone,
    password,
  } = body || {};

  if (!name || !String(name).trim()) {
    throw new DoctorValidationError('Full Name is a required field.');
  }
  if (!specialty || !String(specialty).trim()) {
    throw new DoctorValidationError('Specialty is a required field.');
  }

  const doctorFee = Number(fee || consultationFee);
  if (!Number.isFinite(doctorFee) || doctorFee <= 0) {
    throw new DoctorValidationError('A valid consultation fee is required.');
  }

  // Doctor portal login credentials (created by Admin) — bcrypt hashed.
  let hashedPassword: string | null = null;
  const normalizedEmail = email ? String(email).trim().toLowerCase() : null;
  const normalizedPhone = phone ? String(phone).trim() : null;

  if (normalizedEmail && !password) {
    throw new DoctorValidationError(
      'An initial password is required when setting a login email.'
    );
  }
  if (password && password.length < 4) {
    throw new DoctorValidationError('Password must be at least 4 characters long.');
  }
  if (normalizedEmail && password) {
    hashedPassword = hashPasswordBcrypt(password);
  }

  const onlineState = isOnline !== undefined ? Boolean(isOnline) : true;
  const mainSpecialty = String(specialty || 'General Physician');

  const newDoctor = await prisma.doctor.create({
    data: {
      name: String(name).trim(),
      designation: designation || 'Consultant Specialist',
      degrees: degrees || 'MBBS, FCPS',
      specialty: mainSpecialty,
      specialties: specialties || mainSpecialty,
      workplace: workplace || hospital || 'Dhaka Medical College Hospital',
      hospital: hospital || workplace || 'Dhaka Medical College Hospital',
      education: education || 'Dhaka Medical College',
      experienceYears: Number(experienceYears) || 5,
      fee: doctorFee,
      consultationFee: doctorFee,
      rating: Number(rating) || 5.0,
      totalVisits: Number(totalVisits) || 0,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      departmentSlug: body.departmentSlug || toDepartmentSlug(mainSpecialty),
      isOnline: onlineState,
      status: status || 'ACTIVE', // approved & listed; live presence is tracked via isOnline
      isApproved: true,
      image:
        image ||
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      bio: bio || `Specialist physician in ${mainSpecialty}. Dedicated to compassionate patient care.`,
      languages: languages || 'English, Bengali',
      badge: badge || 'Verified Physician',
      isVerified: true,
    },
  });

  return newDoctor;
}
