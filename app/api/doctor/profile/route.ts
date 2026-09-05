import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// PUT /api/doctor/profile
// Body: { name?, image?, bio?, languages? }
//
// STRICT DATA ISOLATION: updates are always scoped to the doctorId decoded
// from the signed `doctor_session` cookie. A doctor can therefore only edit
// their own public profile (used for the local photo upload in the portal).
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

    const existing = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Doctor account not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        name:
          typeof body?.name === 'string' && body.name.trim()
            ? body.name.trim()
            : existing.name,
        image:
          typeof body?.image === 'string' && body.image.trim()
            ? body.image.trim()
            : existing.image,
        bio:
          typeof body?.bio === 'string' && body.bio.trim()
            ? body.bio.trim()
            : existing.bio,
        languages:
          typeof body?.languages === 'string' && body.languages.trim()
            ? body.languages.trim()
            : existing.languages,
      },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        languages: true,
        specialty: true,
        isOnline: true,
        status: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      doctor,
    });
  } catch (error: any) {
    console.error('Error updating doctor profile:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
