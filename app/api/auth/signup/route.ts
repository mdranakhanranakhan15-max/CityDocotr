import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createPatientSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, location, password } = body || {};

    if (!name || !phone || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, phone number, and password are required.' },
        { status: 400 }
      );
    }

    const trimmedPhone = phone.trim();
    const trimmedName = name.trim();
    const trimmedLocation = location ? location.trim() : null;

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    // Patients register with only a mobile number. Dynamically assign a unique
    // system email derived from the phone digits so every patient row satisfies
    // the unique email constraint on the Patient model.
    const phoneDigits = trimmedPhone.replace(/\D/g, '');
    const systemEmail = `${phoneDigits}@patient.citydoctor.com`;
    const normalizedEmail = body.email
      ? String(body.email).trim().toLowerCase()
      : systemEmail;

    // Check if phone already registered
    const existingPatient = await prisma.patient.findFirst({
      where: { phone: trimmedPhone },
    });

    if (existingPatient && existingPatient.password) {
      return NextResponse.json(
        { success: false, error: 'Mobile number already registered.' },
        { status: 409 }
      );
    }

    const hashedPassword = hashPassword(password);
    let patient;

    if (existingPatient) {
      // Upgrade existing guest/unregistered patient
      patient = await prisma.patient.update({
        where: { id: existingPatient.id },
        data: {
          name: trimmedName,
          email: existingPatient.email || normalizedEmail,
          location: trimmedLocation || existingPatient.location,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          location: true,
          createdAt: true,
        },
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          name: trimmedName,
          phone: trimmedPhone,
          email: normalizedEmail,
          location: trimmedLocation,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          location: true,
          createdAt: true,
        },
      });
    }

    const token = createPatientSessionToken(patient.id);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      patient,
      token,
    });

    response.cookies.set('citydoctor_patient_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Error during patient signup:', error);
    // Unique constraint violation (duplicate phone / system email).
    if (error?.code === 'P2002' && Array.isArray(error?.meta?.target)) {
      const target = error.meta.target.join(',');
      if (target.includes('phone') || target.includes('email')) {
        return NextResponse.json(
          { success: false, error: 'Mobile number already registered.' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register account' },
      { status: 500 }
    );
  }
}

