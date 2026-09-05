import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/doctor/login - Verify admin-created credentials and open a session
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!doctor || !doctor.password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, doctor.password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Set signed, expiring session cookie.
    // Only mark the cookie "Secure" when NOT serving over plain localhost http.
    const host = req.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const token = createSessionToken(doctor.id);
    cookies().set('doctor_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production' && !isLocalhost,
      path: '/',
      maxAge: 60 * 60 * 12,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        image: doctor.image,
      },
    });
  } catch (error: any) {
    console.error('Error during doctor login:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Login failed' },
      { status: 500 }
    );
  }
}
