import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** "Cardiology" -> "cardiology"; "Gynae & Obs" -> "gynae-obs". */
function toDepartmentSlug(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/doctors/[id] - Fetch single doctor profile
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, doctor });
  } catch (error: any) {
    console.error(`Error fetching doctor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch doctor profile' },
      { status: 500 }
    );
  }
}

// PATCH / PUT /api/doctors/[id] - Update doctor profile (Admin)
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    const doctorFee = body.fee !== undefined ? Number(body.fee) : body.consultationFee !== undefined ? Number(body.consultationFee) : existing.fee;
    const isOnline = body.isOnline !== undefined ? Boolean(body.isOnline) : existing.isOnline;

    // Admin-updated doctor portal credentials (hash password only when changed)
    let newPasswordHash: string | undefined;
    if (body.password) {
      newPasswordHash = hashPassword(body.password);
    }
    const newEmail =
      body.email !== undefined
        ? body.email
          ? body.email.toLowerCase().trim()
          : null
        : existing.email;

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        designation: body.designation !== undefined ? body.designation : existing.designation,
        degrees: body.degrees !== undefined ? body.degrees : existing.degrees,
        specialty: body.specialty !== undefined ? body.specialty : existing.specialty,
        departmentSlug:
          body.specialty !== undefined
            ? toDepartmentSlug(body.specialty)
            : body.departmentSlug || existing.departmentSlug,
        specialties: body.specialties !== undefined ? body.specialties : existing.specialties,
        workplace: body.workplace !== undefined ? body.workplace : existing.workplace,
        hospital: body.hospital !== undefined ? body.hospital : body.workplace || existing.hospital,
        education: body.education !== undefined ? body.education : existing.education,
        experienceYears:
          body.experienceYears !== undefined ? Number(body.experienceYears) : existing.experienceYears,
        fee: doctorFee,
        consultationFee: doctorFee,
        rating: body.rating !== undefined ? Number(body.rating) : existing.rating,
        totalVisits: body.totalVisits !== undefined ? Number(body.totalVisits) : existing.totalVisits,
        isOnline: isOnline,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        isApproved:
          body.isApproved !== undefined
            ? Boolean(body.isApproved)
            : existing.isApproved === undefined || existing.isApproved === null
              ? true // legacy records without the flag default to approved
              : existing.isApproved,
        email: newEmail,
        ...(newPasswordHash ? { password: newPasswordHash } : {}),
        image: body.image !== undefined ? body.image : existing.image,
        bio: body.bio !== undefined ? body.bio : existing.bio,
        languages: body.languages !== undefined ? body.languages : existing.languages,
        badge: body.badge !== undefined ? body.badge : existing.badge,
        isVerified: body.isVerified !== undefined ? Boolean(body.isVerified) : existing.isVerified,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updatedDoctor,
    });
  } catch (error: any) {
    console.error(`Error updating doctor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update doctor profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/doctors/[id] - Delete doctor profile (Admin)
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Doctor not found' },
        { status: 404 }
      );
    }

    await prisma.doctor.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Doctor ${existing.name} was successfully removed.`,
    });
  } catch (error: any) {
    console.error(`Error deleting doctor ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete doctor profile' },
      { status: 500 }
    );
  }
}
