import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// POST /api/prescriptions - Save (or update) the digital prescription for an appointment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      appointmentId,
      doctorId,
      patientId,
      doctorName,
      patientName,
      diagnosis,
      medicines,
      tests,
      advice,
    } = body || {};

    if (!appointmentId || !doctorId || !diagnosis || !medicines) {
      return NextResponse.json(
        { success: false, error: 'appointmentId, doctorId, diagnosis, and medicines are required.' },
        { status: 400 }
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { doctor: true, patient: true },
    });
    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const finalDoctorName = doctorName || appointment.doctor?.name || 'Doctor';
    const finalPatientName = patientName || appointment.patient?.name || appointment.patientName;

    const prescription = await prisma.prescription.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        doctorId,
        patientId: patientId || appointment.patientId,
        doctorName: finalDoctorName,
        patientName: finalPatientName,
        diagnosis,
        medicines,
        tests: tests || null,
        advice: advice || null,
      },
      update: {
        doctorId,
        patientId: patientId || appointment.patientId,
        doctorName: finalDoctorName,
        patientName: finalPatientName,
        diagnosis,
        medicines,
        tests: tests || null,
        advice: advice || null,
      },
      include: { appointment: { include: { doctor: true } } },
    });

    // The consultation is now complete
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json(
      { success: true, message: 'Prescription saved successfully', prescription },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error saving prescription:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save prescription' },
      { status: 500 }
    );
  }
}

// GET /api/prescriptions?appointmentId=... - Fetch the prescription for an appointment
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, error: 'appointmentId query param is required.' },
        { status: 400 }
      );
    }

    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId },
      include: {
        appointment: {
          include: {
            doctor: true,
            patient: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, prescription });
  } catch (error: any) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch prescription' },
      { status: 500 }
    );
  }
}
