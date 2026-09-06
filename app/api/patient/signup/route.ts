import { NextResponse } from 'next/server';
import { createPatientSessionToken } from '@/lib/auth';
import {
  registerPatient,
  PatientSignupError,
} from '@/lib/patient-accounts';

export const dynamic = 'force-dynamic';

// POST /api/patient/signup - Patient registration.
// Accepts either `mobileNumber` (with optional `phone` alias) or `email`:
//  - Mobile signups automatically get email `<digits>@patient.citydoctor.com`
//    so the Patient `email @unique` Prisma constraint is always satisfied.
//  - Duplicate mobile numbers / emails return friendly 409 errors.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patient } = await registerPatient(body);

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
    // Unique constraint race (duplicate phone / system email) → friendly error.
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Mobile number or email already registered.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register account' },
      { status: error instanceof PatientSignupError ? error.status : 500 }
    );
  }
}
