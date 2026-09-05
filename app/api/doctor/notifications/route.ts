import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PATCH /api/doctor/notifications
// Body: { notificationIds?: string[] } — marks given DoctorNotification rows as
// read. When no ids are sent every unread notification for this doctor is
// marked read ("dismiss all").
//
// STRICT DATA ISOLATION: the doctor id is decoded from the signed
// `doctor_session` cookie so a doctor can only ever touch their own
// notifications.
export async function PATCH(req: Request) {
  try {
    const token = cookies().get('doctor_session')?.value;
    const doctorId = verifySessionToken(token);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const requestedIds: string[] | undefined = Array.isArray(body?.notificationIds)
      ? body.notificationIds.filter((id: string) => typeof id === 'string')
      : undefined;

    const updateResult = requestedIds?.length
      ? await prisma.doctorNotification.updateMany({
          where: { id: { in: requestedIds }, doctorId },
          data: { isRead: true },
        })
      : await prisma.doctorNotification.updateMany({
          where: { doctorId, isRead: false },
          data: { isRead: true },
        });

    return NextResponse.json({
      success: true,
      updated: updateResult.count,
      message: 'Notifications marked as read.',
    });
  } catch (error: any) {
    console.error('Error updating doctor notifications:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update notifications' },
      { status: 500 }
    );
  }
}
