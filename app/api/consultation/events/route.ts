import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
  formatConsultationTime,
} from '@/lib/timeSlot';
import { sendDoctorSmsAlert } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// POST /api/consultation/events
// Body: { appointmentId, patientName, patientId?, type?: 'PATIENT_WAITING', payload? }
//
// PATIENT CALL INITIATION ONLY.
// Called when the PATIENT clicks "Call Doctor" inside the consultation room.
// The server enforces two hard rules before anything is emitted:
//
//  1. Slot window — the patient may initiate ONLY between 5 minutes before the
//     scheduled slot and the end of the slot duration. Any earlier/later
//     attempt is rejected (no event, no modal, no doctor ping).
//
//  2. Doctor availability — if `doctor.isOnline` is TRUE a real-time CallEvent
//     is stored so the doctor dashboard instantly pops the "Incoming Call"
//     modal. If the doctor is OFFLINE no CallEvent is created (so NO modal can
//     fire) — instead a DoctorNotification is stored and an SMS alert is logged
//     to the doctor.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { appointmentId, patientName } = body || {};

    if (!appointmentId || !patientName) {
      return NextResponse.json(
        { success: false, error: 'appointmentId and patientName are required.' },
        { status: 400 }
      );
    }

    // Only the patient initiates the call. Doctor-side join actions never POST
    // here — they navigate straight to the room with ?role=doctor.
    if (body?.initiatedBy === 'doctor') {
      return NextResponse.json(
        { success: false, error: 'Only the patient can initiate a consultation call.' },
        { status: 403 }
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

    // The events API only creates PATIENT_WAITING (patient dialling the doctor).
    // State transitions (CALL_ACCEPTED / CALL_ENDED / read flags) are handled
    // by PATCH /api/consultation/events/[id].
    const eventType = 'PATIENT_WAITING';

    // ---- 1) Appointment slot time-window enforcement (server truth) ----
    const win = getConsultationWindow(
      appointment.scheduledAt,
      appointment.timeSlot,
      appointment.doctor?.slotDuration
    );
    const windowStatus = getConsultationWindowStatus(win);

    if (windowStatus === 'not_started') {
      return NextResponse.json(
        {
          success: false,
          code: 'CALL_NOT_OPEN',
          error: `Call opens at ${formatConsultationTime(win.opensAt)}`,
          opensAt: win.opensAt,
        },
        { status: 403 }
      );
    }

    if (windowStatus === 'ended') {
      return NextResponse.json(
        {
          success: false,
          code: 'CALL_WINDOW_ENDED',
          error: 'The consultation slot for this appointment has already ended.',
          closesAt: win.closesAt,
        },
        { status: 403 }
      );
    }

    // ---- 2) Doctor availability decides real-time modal vs stored notice ----
    const doctorOnline = Boolean(appointment.doctor?.isOnline);
    const displayName = patientName || appointment.patientName || 'Patient';
    const slotLabel = appointment.timeSlot || formatConsultationTime(appointment.scheduledAt);

    if (!doctorOnline) {
      // OFFLINE → NO real-time event / modal. Persist a DoctorNotification and
      // log the SMS alert to the doctor's configured number (mock in dev).
      const smsAlert = await sendDoctorSmsAlert({
        message: `CityDoctor: ${displayName} tried to start their scheduled consultation (${slotLabel}) but you were offline. Log in and open the appointment from your queue.`,
      });

      const notification = await prisma.doctorNotification.create({
        data: {
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          type: 'MISSED_CALL_OFFLINE',
          channel: 'DB',
          title: 'Missed video call request',
          message: `${displayName} tried to start the scheduled consultation (${slotLabel}) while you were offline. No call alert was shown. ${
            smsAlert
              ? `An SMS alert was logged to ${smsAlert.to}.`
              : 'An SMS alert could not be sent (no doctor SMS number configured).'
          }`,
          phone: smsAlert?.to || null,
        },
      });

      return NextResponse.json(
        {
          success: true,
          doctorOnline: false,
          message: `Dr. ${appointment.doctor?.name} is currently offline. Your request has been saved and an SMS alert has been sent to the doctor.`,
          notification,
        },
        { status: 200 }
      );
    }

    // ONLINE → create a real-time CallEvent so the doctor dashboard pops the
    // "Incoming Call" modal. Deduplicate: if an identical unread event already
    // exists for this appointment (last 10 minutes) reuse it instead of
    // stacking multiple incoming-call popups.
    const existing = await prisma.callEvent.findFirst({
      where: {
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        type: eventType,
        isRead: false,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    const event =
      existing ||
      (await prisma.callEvent.create({
        data: {
          appointmentId: appointment.id,
          doctorId: appointment.doctorId,
          patientName: displayName,
          type: eventType,
          payload: JSON.stringify({
            timeSlot: appointment.timeSlot,
            scheduledAt: appointment.scheduledAt,
            symptoms: appointment.symptoms,
            phone: appointment.patient?.phone || appointment.patientPhone,
            initiatedAt: new Date().toISOString(),
          }),
        },
      }));

    return NextResponse.json(
      {
        success: true,
        doctorOnline: true,
        message: 'Calling your doctor now…',
        event,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating consultation event:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}


// GET /api/consultation/events?doctorId=...&type=PATIENT_WAITING
// Polled by the doctor dashboard to surface incoming call notifications.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const type = searchParams.get('type') || 'PATIENT_WAITING';
    const limit = Number(searchParams.get('limit')) || 10;

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'doctorId query param is required.' },
        { status: 400 }
      );
    }

    const events = await prisma.callEvent.findMany({
      where: {
        doctorId,
        type,
        isRead: false,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) }, // last 1 hour
      },
      include: {
        appointment: {
          select: {
            id: true,
            timeSlot: true,
            symptoms: true,
            doctorId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ success: true, count: events.length, events });
  } catch (error: any) {
    console.error('Error fetching consultation events:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

