import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPatientSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/patient/appointments
// Returns the logged-in patient's own booking history.
//
// STRICT ISOLATION: the patientId is never taken from the client — it is decoded
// from the signed `citydoctor_patient_token` cookie, so a patient can only ever
// see their own appointments, doctors and prescriptions.
//
// Appointments are matched by the session patientId OR the session phone, so
// history created under a phone-only/guest booking (patientPhone snapshot or
// patient.phone) is still returned after the patient logs in with that phone.
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('citydoctor_patient_token')?.value;
    const sessionPatientId = verifyPatientSessionToken(token);

    if (!sessionPatientId) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // The session cookie authenticates the patient by id; resolve that same
    // session account's phone from the DB so phone-linked bookings (below)
    // can be matched against the identifiers carried by the active session.
    const patient = await prisma.patient.findUnique({
      where: { id: sessionPatientId },
      select: { id: true, name: true, phone: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Patient account not found' },
        { status: 404 }
      );
    }

    const sessionPatientPhone = patient.phone;

    // QUERY-MISMATCH FIX: legacy / guest bookings may only carry the phone
    // number (denormalized patientPhone snapshot, or the patient relation's
    // phone) with a NULL patientId. Match by id OR phone so the patient's
    // full history loads no matter how the appointment was created.
    // Phone clauses are only added when a phone exists for the session — an
    // equality-to-NULL filter would otherwise match every NULL-phone row.
    const where = sessionPatientPhone
      ? {
          OR: [
            { patientId: sessionPatientId },
            { patientPhone: sessionPatientPhone },
            { patient: { phone: sessionPatientPhone } },
          ],
        }
      : { patientId: sessionPatientId };

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            designation: true,
            hospital: true,
            image: true,
            consultationFee: true,
            slotDuration: true,
          },
        },
        prescription: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      patient,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    console.error('Error loading patient appointments:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: error?.message || 'Failed to load appointments' },
      { status: 500 }
    );
  }
}
