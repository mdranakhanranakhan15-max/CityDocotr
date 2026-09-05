import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/doctor/status
// Body: { isOnline: boolean }
//
// STRICT DATA ISOLATION: only the doctor identified by the signed
// `doctor_session` cookie may change their own availability. The update is
// scoped with `where: { id: doctorId }` so a logged-in doctor can never
// mutate another doctor's record. Updating `isOnline` here instantly changes
// the "Active Online" badge served to the public website via /api/doctors.
export async function PUT(req: Request) {
  try {
    const token = cookies().get('doctor_session')?.value;
    const doctorId = verifySessionToken(token);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (typeof body?.isOnline !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'isOnline (boolean) is required.' },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        isOnline: body.isOnline,
        status: body.isOnline ? 'ONLINE' : 'OFFLINE',
      },
      select: {
        id: true,
        name: true,
        isOnline: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: body.isOnline
        ? 'You are now Online — patients can start an instant video call.'
        : 'You are now Offline — you will only appear for scheduled bookings.',
      doctor,
    });
  } catch (error: any) {
    console.error('Error toggling doctor availability:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update availability' },
      { status: 500 }
    );
  }
}
