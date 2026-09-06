import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/** Error carrying an HTTP status so route handlers can respond consistently. */
export class PatientSignupError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = 'PatientSignupError';
    this.status = status;
  }
}

const SAFE_PATIENT_SELECT = {
  id: true,
  name: true,
  phone: true,
  email: true,
  location: true,
  createdAt: true,
} as const;

/**
 * Shared patient registration logic used by /api/patient/signup and
 * /api/auth/signup.
 *
 * Accepts EITHER a mobile number (`mobileNumber`, `phone` accepted as aliases)
 * OR an email. When signing up with a mobile number only, a unique system
 * email is derived from the phone digits (`<digits>@patient.citydoctor.com`)
 * so every Patient row satisfies the `email @unique` Prisma constraint.
 */
export async function registerPatient(body: any) {
  const { name, mobileNumber, phone, email, location, password } = body || {};

  if (!name || !password) {
    throw new PatientSignupError('Full name and password are required.');
  }

  const trimmedName = String(name).trim();
  const rawMobile = mobileNumber !== undefined ? mobileNumber : phone;
  const providedEmail = email ? String(email).trim().toLowerCase() : null;

  if (!rawMobile && !providedEmail) {
    throw new PatientSignupError(
      'Either a mobile number or an email address is required to sign up.'
    );
  }

  if (String(password).length < 4) {
    throw new PatientSignupError('Password must be at least 4 characters long.');
  }

  const trimmedLocation = location ? String(location).trim() : null;

  // ---- Sign up with a MOBILE NUMBER -------------------------------------
  if (rawMobile) {
    const trimmedPhone = String(rawMobile).trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (!phoneDigits) {
      throw new PatientSignupError('Please enter a valid mobile number.');
    }

    // Dynamically assign a unique system email derived from the phone digits
    // (an explicit email may override it).
    const systemEmail = `${phoneDigits}@patient.citydoctor.com`;
    const normalizedEmail = providedEmail || systemEmail;

    const existingPatient = await prisma.patient.findFirst({
      where: { phone: trimmedPhone },
    });

    if (existingPatient?.password) {
      throw new PatientSignupError('Mobile number already registered.', 409);
    }

    const hashedPassword = hashPassword(password);

    if (existingPatient) {
      // Upgrade a password-less guest / unregistered patient record.
      const patient = await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          name: trimmedName,
          email: existingPatient.email || normalizedEmail,
          location: trimmedLocation || existingPatient.location,
          password: hashedPassword,
        },
        select: SAFE_PATIENT_SELECT,
      });
      return { patient, via: 'phone' as const };
    }

    const patient = await prisma.patient.create({
      data: {
        name: trimmedName,
        phone: trimmedPhone,
        email: normalizedEmail,
        location: trimmedLocation,
        password: hashedPassword,
      },
      select: SAFE_PATIENT_SELECT,
    });
    return { patient, via: 'phone' as const };
  }

  // ---- Sign up with an EMAIL --------------------------------------------
  if (!providedEmail) {
    throw new PatientSignupError('A valid email address is required.');
  }

  const existingByEmail = await prisma.patient.findUnique({
    where: { email: providedEmail },
  });

  if (existingByEmail?.password) {
    throw new PatientSignupError('Email already registered.', 409);
  }

  const hashedPassword = hashPassword(password);

  if (existingByEmail) {
    // Upgrade a password-less guest / unregistered patient record.
    const patient = await prisma.patient.update({
      where: { id: existingByEmail.id },
      data: {
        name: trimmedName,
        location: trimmedLocation || existingByEmail.location,
        password: hashedPassword,
      },
      select: SAFE_PATIENT_SELECT,
    });
    return { patient, via: 'email' as const };
  }

  const patient = await prisma.patient.create({
    data: {
      name: trimmedName,
      email: providedEmail,
      location: trimmedLocation,
      password: hashedPassword,
    },
    select: SAFE_PATIENT_SELECT,
  });
  return { patient, via: 'email' as const };
}
