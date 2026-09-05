import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createBkashPayment } from '@/lib/bkash';
import { parseTimeSlotToDate, isValidDoctorScheduleSlot, parseAvailableDays } from '@/lib/timeSlot';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      doctorId,
      patientId,
      patientName,
      patientPhone,
      patientLocation,
      patientEmail,
      timeSlot,
      symptoms,
      amount,
    } = body || {};

    if (!doctorId) {
      return NextResponse.json(
        { success: false, error: 'Doctor ID is required to initiate bKash payment.' },
        { status: 400 }
      );
    }

    if (!patientId && (!patientName || !patientPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Patient information (name & phone) is required.',
        },
        { status: 400 }
      );
    }

    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      return NextResponse.json(
        { success: false, error: 'Selected doctor could not be found.' },
        { status: 404 }
      );
    }

    // Resolve or create patient account
    let patient: any = null;
    if (patientId) {
      patient = await prisma.patient.findUnique({ where: { id: patientId } });
    }
    if (!patient && patientPhone) {
      patient = await prisma.patient.findFirst({
        where: { phone: patientPhone.trim() },
        orderBy: { createdAt: 'desc' },
      });
      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            name: patientName.trim(),
            phone: patientPhone.trim(),
            location: patientLocation ? patientLocation.trim() : null,
            // Store emails lowercased so they can be matched on email login.
            email: patientEmail ? patientEmail.trim().toLowerCase() : null,
          },
        });
      }
    }

    const finalName = patientName || patient?.name || 'Patient';
    const finalPhone = patientPhone || patient?.phone || '';
    const finalLocation = patientLocation || patient?.location || null;
    const finalAmount = Number(amount || doctor.consultationFee || 349);

    const parsedSlot = parseTimeSlotToDate(timeSlot);

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

    const scheduledAt = parsedSlot || new Date();

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create the initial appointment in PENDING status
    const appointment = await prisma.appointment.create({
      data: {
        doctorId,
        patientId: patient?.id || null,
        patientName: finalName,
        patientEmail: patientEmail || patient?.email || null,
        patientPhone: finalPhone,
        patientLocation: finalLocation,
        timeSlot: timeSlot || null,
        symptoms: symptoms || 'General Online Consultation',
        scheduledAt,
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        paymentMethod: 'BKASH',
        transactionId: invoiceNumber,
        amountPaid: finalAmount,
      },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (req.headers.get('origin') || 'http://localhost:3000');
    const callbackURL = `${baseUrl}/payment/callback`;

    // Initiate bKash Payment with merchant credentials
    const bkashRes = await createBkashPayment({
      amount: finalAmount,
      merchantInvoiceNumber: invoiceNumber,
      payerReference: finalPhone || '01700000000',
      callbackURL,
    });

    // Update appointment with created paymentID for verification during execution
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        transactionId: bkashRes.paymentID || invoiceNumber,
        notes: JSON.stringify({
          invoiceNumber,
          paymentID: bkashRes.paymentID,
        }),
      },
    });

    let finalBkashURL = bkashRes.bkashURL;
    if (finalBkashURL && finalBkashURL.startsWith('/payment/mock-bkash')) {
      finalBkashURL += `&appointmentId=${appointment.id}`;
    }

    return NextResponse.json({
      success: true,
      bkashURL: finalBkashURL,
      paymentID: bkashRes.paymentID,
      appointmentId: appointment.id,
      merchantInvoiceNumber: invoiceNumber,
      amount: finalAmount,
    });
  } catch (error: any) {
    console.error('Error creating bKash payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to initiate bKash payment',
      },
      { status: 500 }
    );
  }
}

