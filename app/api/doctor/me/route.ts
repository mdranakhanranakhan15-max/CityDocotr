import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/doctor/me - Return the currently logged-in doctor (session based)
export async function GET() {
  try {
    const token = cookies().get('doctor_session')?.value;
    const doctorId = verifySessionToken(token);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        specialty: true,
        specialties: true,
        designation: true,
        degrees: true,
        hospital: true,
        image: true,
        consultationFee: true,
        isOnline: true,
        status: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor account not found', authenticated: false },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, authenticated: true, doctor });
  } catch (error: any) {
    console.error('Error fetching doctor session:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
