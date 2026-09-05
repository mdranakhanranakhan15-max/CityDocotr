import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalDoctors,
      onlineDoctors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      totalPatients,
      doctorsWithFees,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { status: 'ONLINE' } }),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { status: 'PENDING' } }),
      prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.patient.count(),
      prisma.appointment.findMany({
        include: {
          doctor: { select: { consultationFee: true } },
        },
      }),
    ]);

    const totalRevenue = doctorsWithFees.reduce((acc, appt) => {
      return acc + (appt.doctor?.consultationFee || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalDoctors,
        onlineDoctors,
        offlineDoctors: totalDoctors - onlineDoctors,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        totalPatients,
        totalRevenue: Math.round(totalRevenue),
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

