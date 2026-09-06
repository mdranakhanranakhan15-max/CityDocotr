import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/doctor/appointments - ONLY PAID (confirmed) appointments for the
// logged-in doctor. Unpaid / failed / pending-payment attempts never reach a
// doctor's queue — they are tracked in the Admin panel instead.
export async function GET() {
  try {
    const token = cookies().get('doctor_session')?.value;
    const doctorId = verifySessionToken(token);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
          },
        },
        prescription: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    console.error('Error fetching doctor appointments:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
