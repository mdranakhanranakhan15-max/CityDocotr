import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken } from '@/lib/auth';
import { startOfTodayDhaka, endOfTodayDhaka } from '@/lib/timeSlot';

export const dynamic = 'force-dynamic';

const round2 = (n: number) => Math.round(n * 100) / 100;

// GET /api/doctor/dashboard
// Single isolated source of truth for the Doctor Portal:
//  - profile (self)
//  - stats (today's appointments, patients treated, full-fee earnings)
//  - today's PAID appointment queue (scheduled today, not cancelled)
//  - upcoming PAID scheduled appointments (from tomorrow onwards, chronological)
//  - completed appointment history (incl. digital prescriptions)
//
// STRICT DATA ISOLATION: every query is scoped with `where: { doctorId }`
// where doctorId is decoded from the signed `doctor_session` cookie. A doctor
// can never see (or receive) another doctor's patients, appointments or
// prescriptions because there is no client-supplied identifier anywhere.
export async function GET() {
  try {
    const token = cookies().get('doctor_session')?.value;
    const doctorId = verifySessionToken(token);

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        specialty: true,
        specialties: true,
        designation: true,
        degrees: true,
        hospital: true,
        badge: true,
        isVerified: true,
        isOnline: true,
        status: true,
        consultationFee: true,
      },
    });

    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Doctor account not found', authenticated: false },
        { status: 404 }
      );
    }

    // --- "Today" is resolved in Asia/Dhaka wall-clock terms so bookings made
    // for the early hours of the Dhaka day never land on the previous UTC day
    // (the timezone bug that hid them from today's queue). ---
    const now = new Date();
    const startOfToday = startOfTodayDhaka(now);
    const endOfToday = endOfTodayDhaka(now);

    const patientSelect = {
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        location: true,
        age: true,
        gender: true,
      },
    };

    const [todayAppointments, upcomingAppointments, history, totalCompleted, totalPaidCompleted, notifications] =
      await Promise.all([
        // Today's queue — ONLY paid (CONFIRMED) consultations scheduled in the
        // current Asia/Dhaka calendar day. Unpaid / failed / pending-payment
        // attempts are tracked in the Admin panel, never in the doctor queue.
        prisma.appointment.findMany({
          where: {
            doctorId,
            scheduledAt: { gte: startOfToday, lt: endOfToday },
            paymentStatus: 'PAID',
            status: { not: 'CANCELLED' },
          },
          include: { patient: patientSelect, prescription: true },
          orderBy: { scheduledAt: 'asc' },
        }),

        // Upcoming appointments — every PAID, non-completed / non-cancelled
        // booking from tomorrow onwards, shown chronologically on its own tab.
        prisma.appointment.findMany({
          where: {
            doctorId,
            scheduledAt: { gte: endOfToday },
            paymentStatus: 'PAID',
            status: { notIn: ['CANCELLED', 'COMPLETED'] },
          },
          include: { patient: patientSelect, prescription: true },
          orderBy: { scheduledAt: 'asc' },
        }),

        // Patient history — paid completed consultations with digital
        // prescriptions. Unpaid / pending records are never shown to a doctor.
        prisma.appointment.findMany({
          where: { doctorId, status: 'COMPLETED', paymentStatus: 'PAID' },
          include: { patient: patientSelect, prescription: true },
          orderBy: { scheduledAt: 'desc' },
          take: 250,
        }),

        // Lifetime patients treated = completed consultations.
        prisma.appointment.count({ where: { doctorId, status: 'COMPLETED' } }),

        // Paid & completed consultations that count towards doctor earnings.
        prisma.appointment.count({
          where: { doctorId, status: 'COMPLETED', paymentStatus: 'PAID' },
        }),

        // Unread notifications — e.g. patients who tried to call while the
        // doctor was OFFLINE (no incoming-call modal fires; stored instead).
        prisma.doctorNotification.findMany({
          where: { doctorId, isRead: false },
          include: {
            appointment: {
              select: {
                id: true,
                patientName: true,
                timeSlot: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        }),
      ]);

    // Earnings = full consultation fee per paid & completed consultation.
    // The 80% platform split has been removed — the doctor earns 100% of their
    // Consultation Fee (VAT & platform charge are billed to the patient on top).
    const consultationFee = doctor.consultationFee || 0;
    const earningsPerConsult = round2(consultationFee);
    const totalEarnings = round2(totalPaidCompleted * consultationFee);

    return NextResponse.json({
      success: true,
      authenticated: true,
      doctor,
      stats: {
        todayAppointments: todayAppointments.length,
        totalPatientsTreated: totalCompleted,
        totalEarnings,
        paidConsultations: totalPaidCompleted,
        consultationFee,
        earningsPerConsult,
      },
      todayAppointments,
      upcomingAppointments,
      history,
      notifications,
    });
  } catch (error: any) {
    console.error('Error loading doctor dashboard:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
