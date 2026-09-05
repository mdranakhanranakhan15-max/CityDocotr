import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// Safe number coercion: returns fallback when the value is not a finite number
function num(value: any, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

// Normalizes availableDays (array OR comma-separated string) to a clean comma-separated string
// stored in SQLite. e.g. ["Sat","Sun"] -> "Sat, Sun"
function toDaysString(value: any): string {
  if (Array.isArray(value)) {
    return value.map((d) => String(d).trim()).filter(Boolean).join(', ');
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
      .join(', ');
  }
  return value === undefined || value === null ? '' : String(value);
}

// GET /api/admin/doctors/[id] - Fetch single doctor (admin panel)
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const doctor = await prisma.doctor.findUnique({ where: { id } });
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

// PUT /api/admin/doctors/[id] - Full doctor profile update (Schedule, Fees/VAT, BMDC Compliance)
export async function PUT(req: Request, { params }: RouteParams) {
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

    // ---- Consultation fee (fee is Int, consultationFee is Float - keep them in sync) ----
    const feeValue =
      body.consultationFee !== undefined
        ? num(body.consultationFee, existing.consultationFee)
        : body.fee !== undefined
          ? num(body.fee, existing.fee)
          : existing.consultationFee;

    const isOnline = body.isOnline !== undefined ? Boolean(body.isOnline) : existing.isOnline;

    // Admin-updated doctor portal credentials (hash password only when changed)
    let newPasswordHash: string | undefined;
    if (body.password) {
      newPasswordHash = hashPassword(body.password);
    }
    const newEmail =
      body.email !== undefined
        ? body.email
          ? String(body.email).toLowerCase().trim()
          : null
        : existing.email;

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name : existing.name,
        designation: body.designation !== undefined ? body.designation : existing.designation,
        degrees: body.degrees !== undefined ? body.degrees : existing.degrees,
        specialty: body.specialty !== undefined ? body.specialty : existing.specialty,
        specialties: body.specialties !== undefined ? body.specialties : existing.specialties,
        workplace: body.workplace !== undefined ? body.workplace : existing.workplace,
        hospital: body.hospital !== undefined ? body.hospital : body.workplace || existing.hospital,
        education: body.education !== undefined ? body.education : existing.education,
        experienceYears:
          body.experienceYears !== undefined
            ? Math.max(0, Math.round(num(body.experienceYears, existing.experienceYears)))
            : existing.experienceYears,
        fee: Math.round(feeValue),
        consultationFee: feeValue,
        rating: body.rating !== undefined ? num(body.rating, existing.rating) : existing.rating,
        totalVisits:
          body.totalVisits !== undefined
            ? Math.max(0, Math.round(num(body.totalVisits, existing.totalVisits)))
            : existing.totalVisits,
        isOnline,
        status: isOnline ? 'ONLINE' : 'OFFLINE',
        email: newEmail,
        ...(newPasswordHash ? { password: newPasswordHash } : {}),
        image: body.image !== undefined ? body.image : existing.image,
        bio: body.bio !== undefined ? body.bio : existing.bio,
        languages: body.languages !== undefined ? body.languages : existing.languages,
        badge: body.badge !== undefined ? body.badge : existing.badge,
        isVerified: body.isVerified !== undefined ? Boolean(body.isVerified) : existing.isVerified,

        // ---- Schedule & Slot Management ----
        availableDays:
          body.availableDays !== undefined ? toDaysString(body.availableDays) : existing.availableDays,
        shiftStartTime:
          body.shiftStartTime !== undefined ? String(body.shiftStartTime) : existing.shiftStartTime,
        shiftEndTime:
          body.shiftEndTime !== undefined ? String(body.shiftEndTime) : existing.shiftEndTime,
        slotDuration:
          body.slotDuration !== undefined
            ? Math.max(1, Math.round(num(body.slotDuration, existing.slotDuration)))
            : existing.slotDuration,
        maxPatientsPerSlot:
          body.maxPatientsPerSlot !== undefined
            ? Math.max(1, Math.round(num(body.maxPatientsPerSlot, existing.maxPatientsPerSlot)))
            : existing.maxPatientsPerSlot,

        // ---- Pricing & Tax Breakdown ----
        vatPercent:
          body.vatPercent !== undefined
            ? Math.min(100, Math.max(0, num(body.vatPercent, existing.vatPercent)))
            : existing.vatPercent,
        platformFee:
          body.platformFee !== undefined
            ? Math.max(0, num(body.platformFee, existing.platformFee))
            : existing.platformFee,
        doctorCommissionPercent:
          body.doctorCommissionPercent !== undefined
            ? Math.min(100, Math.max(0, num(body.doctorCommissionPercent, existing.doctorCommissionPercent)))
            : existing.doctorCommissionPercent,

        // ---- BMDC & Medical Compliance / Controls ----
        bmdcRegNum:
          body.bmdcRegNum !== undefined ? String(body.bmdcRegNum).trim() : existing.bmdcRegNum,
        isInstantCallAvailable:
          body.isInstantCallAvailable !== undefined
            ? Boolean(body.isInstantCallAvailable)
            : existing.isInstantCallAvailable,
        isOnVacation:
          body.isOnVacation !== undefined ? Boolean(body.isOnVacation) : existing.isOnVacation,
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
