import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createDoctorRecord,
  DoctorValidationError,
} from '@/lib/doctor-accounts';

export const dynamic = 'force-dynamic';

// GET /api/admin/doctors - Admin directory list (all doctors, newest first).
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const doctors = await prisma.doctor.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { specialty: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { hospital: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: [{ createdAt: 'desc' }, { rating: 'desc' }],
    });

    return NextResponse.json({ success: true, count: doctors.length, doctors });
  } catch (error: any) {
    console.error('Error fetching doctors for admin:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST /api/admin/doctors - Create a new doctor from the Admin Panel.
// Full Name, Specialty, Email, Phone, Consultation Fee and Initial Password
// are handled by createDoctorRecord() which hashes the password with bcrypt.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doctor = await createDoctorRecord(body);

    return NextResponse.json(
      { success: true, message: 'Doctor profile created successfully', doctor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating doctor via admin:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create doctor profile' },
      { status: error instanceof DoctorValidationError ? error.status : 500 }
    );
  }
}
