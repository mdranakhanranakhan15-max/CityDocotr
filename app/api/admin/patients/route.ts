import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        location: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      patients,
    });
  } catch (error: any) {
    console.error('Error fetching patients for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch patients list.' },
      { status: 500 }
    );
  }
}

