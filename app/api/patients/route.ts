import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/patients?phone=01XXXXXXXXX - Find an existing patient by phone
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required.' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

// POST /api/patients - Register/Login a patient (find-or-create by phone)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, location } = body || {};

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Full name and mobile number are required.' },
        { status: 400 }
      );
    }

    // "Login": re-use an existing patient account with the same mobile number
    let patient = await prisma.patient.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });

    if (patient) {
      // Keep profile up to date with the latest registration data
      patient = await prisma.patient.update({
        where: { id: patient.id },
        data: {
          name,
          phone,
          location: location || patient.location,
        },
      });
    } else {
      patient = await prisma.patient.create({
        data: {
          name,
          phone,
          location: location || null,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: patient ? 'Patient registered successfully' : 'Patient created successfully',
        patient,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error registering patient:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to register patient' },
      { status: 500 }
    );
  }
}
