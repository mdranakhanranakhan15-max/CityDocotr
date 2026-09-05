import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseTimeSlotToDate, isValidDoctorScheduleSlot, parseAvailableDays } from '@/lib/timeSlot';
import { sendAppointmentConfirmationSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// GET /api/appointments - List appointments with doctor and patient details
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId');
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');

    const whereClause: any = {};
    if (doctorId) whereClause.doctorId = doctorId;
    if (patientId) whereClause.patientId = patientId;
    if (status && status !== 'ALL') whereClause.status = status.toUpperCase();
    if (paymentStatus && paymentStatus !== 'ALL')
      whereClause.paymentStatus = paymentStatus.toUpperCase();

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        doctor: {
          select: {
            id: true,
            name: true,
            specialty: true,
            hospital: true,
            consultationFee: true,
            image: true,
            status: true,
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            location: true,
            email: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Book consultation & process payment
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      doctorId,
      patientId,
      patientName,
      patientEmail,
      patientPhone,
      patientLocation,
      timeSlot,
      symptoms,
      scheduledAt,
      notes,
      paymentStatus,
      paymentMethod,
      transactionId,
      amountPaid,
    } = body;

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required.' },
        { status: 400 }
      );
    }

    if (!patientId && (!patientName || !patientPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient ID, or patient name and phone number are required.',
        },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Selected doctor not found' },
        { status: 404 }
      );
    }

    // Find or create patient record (link real patient data to the booking)
    let patient: any = null;
    if (patientId) {
      patient = await prisma.patient.findUnique({ where: { id: patientId } });
      if (!patient) {
        return NextResponse.json(
          { success: false, error: 'Patient account not found' },
          { status: 404 }
        );
      }
    } else {
      patient = await prisma.patient.findFirst({
        where: { phone: patientPhone },
        orderBy: { createdAt: 'desc' },
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            name: patientName,
            // Store emails lowercased so they can be matched on email login.
            email: patientEmail ? patientEmail.trim().toLowerCase() : null,
            phone: patientPhone || null,
            location: patientLocation || null,
          },
        });
      }
    }

    const finalName = patientName || patient.name;
    const finalEmail = patientEmail || patient.email;
    const finalPhone = patientPhone || patient.phone;
    const finalLocation = patientLocation || patient.location;

    const fee = amountPaid || doctor.consultationFee;
    const finalPaymentStatus = paymentStatus || 'PAID';
    const finalTxnId =
      transactionId ||
      `TXN-${(paymentMethod || 'PAY').toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // Prefer an explicit scheduledAt; otherwise derive it from the human-readable time slot.
    const parsedSlot = parseTimeSlotToDate(timeSlot);
    const finalScheduledAt = scheduledAt ? new Date(scheduledAt) : parsedSlot || new Date();

    // Enforce the doctor's saved weekly schedule + slot settings on the server.
    if (parsedSlot && !isValidDoctorScheduleSlot(doctor, parsedSlot)) {
      const days = parseAvailableDays(doctor.availableDays);
      return NextResponse.json(
        {
          success: false,
          error: `The selected time is outside Dr. ${doctor.name}'s schedule. This doctor is available on ${
            days.length ? days.join(', ') : 'no days'
          } within their daily shift window. Please pick an available slot.`,
        },
        { status: 400 }
      );
    }

    // Create Appointment with payment records
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient.id,
        patientName: finalName,
        patientEmail: finalEmail,
        patientPhone: finalPhone,
        patientLocation: finalLocation,
        timeSlot: timeSlot || null,
        symptoms: symptoms || 'General Medical Consultation',
        notes: notes || null,
        scheduledAt: finalScheduledAt,
        status: 'CONFIRMED',
        paymentStatus: finalPaymentStatus,
        paymentMethod: paymentMethod || 'BKASH',
        transactionId: finalTxnId,
        amountPaid: fee,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    // Point the meeting link at the created appointment so the unified
    // consultation workspace can load the full booking context.
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { meetingLink: `/consultation/${appointment.id}` },
    });

    // Return the appointment with the final meetingLink populated
    const finalAppointment = await prisma.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        doctor: true,
        patient: true,
      },
    });

    // Send an SMS confirmation for PAID bookings with a scheduled slot (used by
    // the Card gateway checkout path). Best-effort — must never fail the booking.
    if (finalPaymentStatus === 'PAID' && timeSlot && finalAppointment) {
      try {
        await sendAppointmentConfirmationSms(finalAppointment, finalTxnId);
      } catch (e) {
        console.error('Failed to send appointment confirmation SMS:', e);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment and payment processed successfully',
        appointment: finalAppointment || appointment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to book appointment' },
      { status: 500 }
    );
  }
}
