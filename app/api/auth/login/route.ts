import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { passwordMatches, createPatientSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, identifier, password } = body || {};

    // Accept either a phone number or an email address as the login identifier.
    const rawIdentifier = String(identifier || phone || '').trim();

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: 'Mobile number/email and password are required.' },
        { status: 400 }
      );
    }

    const isEmail = rawIdentifier.includes('@');

    // Patients sign up with a phone number, but bookings/seed data also attach an
    // email — support both. Emails are stored normalized to lowercase.
    const patient = isEmail
      ? await prisma.patient.findFirst({
          where: { email: rawIdentifier.toLowerCase() },
        })
      : await prisma.patient.findFirst({
          where: { phone: rawIdentifier },
        });

    if (!patient) {
      return NextResponse.json(
        {
          success: false,
          error: isEmail
            ? 'No account found with this email address. Please sign up.'
            : 'No account found with this mobile number. Please sign up.',
        },
        { status: 404 }
      );
    }

    if (!patient.password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password not set for this account. Please sign up to create your password.',
        },
        { status: 400 }
      );
    }

    // Support scrypt, bcrypt AND legacy plain-text stored passwords so that
    // accounts created before the unified password scheme can still log in.
    const isMatch = passwordMatches(password, patient.password || '');
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid password. Please check and try again.' },
        { status: 401 }
      );
    }

    const token = createPatientSessionToken(patient.id);

    const safePatient = {
      id: patient.id,
      name: patient.name,
      phone: patient.phone,
      location: patient.location,
      createdAt: patient.createdAt,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      patient: safePatient,
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
    console.error('Error during patient login:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to login' },
      { status: 500 }
    );
  }
}

