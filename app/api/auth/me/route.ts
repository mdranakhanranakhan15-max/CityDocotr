import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPatientSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('citydoctor_patient_token')?.value;

    if (!token) {
      return NextResponse.json({ success: true, patient: null });
    }

    const patientId = verifyPatientSessionToken(token);
    if (!patientId) {
      return NextResponse.json({ success: true, patient: null });
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        createdAt: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ success: true, patient: null });
    }

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error verifying patient session:', error);
    return NextResponse.json({ success: true, patient: null });
  }
}

