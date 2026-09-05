import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { executeBkashPayment } from '@/lib/bkash';
import {
  getConsultationWindow,
  getConsultationWindowStatus,
} from '@/lib/timeSlot';
import { sendAppointmentConfirmationSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentID, appointmentId } = body || {};

    if (!paymentID) {
      return NextResponse.json(
        { success: false, error: 'paymentID is required to execute bKash payment.' },
        { status: 400 }
      );
    }

    // 1. Call bKash Execute Payment API
    const bkashRes = await executeBkashPayment(paymentID);

    if (bkashRes.statusCode && bkashRes.statusCode !== '0000') {
      return NextResponse.json(
        {
          success: false,
          error: bkashRes.statusMessage || 'bKash payment could not be completed.',
        },
        { status: 400 }
      );
    }

    // 2. Find Appointment record
    let appointment = null;
    if (appointmentId) {
      appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: { doctor: true, patient: true },
      });
    }

    if (!appointment) {
      appointment = await prisma.appointment.findFirst({
        where: {
          OR: [
            { transactionId: paymentID },
            { notes: { contains: paymentID } },
          ],
        },
        include: { doctor: true, patient: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    const finalTrxId = bkashRes.trxID || `TRX-${Date.now().toString().slice(-8)}`;

    if (appointment) {
      // 3. Update appointment to CONFIRMED & PAID
      const updated = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paymentMethod: 'BKASH',
          transactionId: finalTrxId,
          meetingLink: `/consultation/${appointment.id}`,
          // APPOINTMENT TIME IMMUTABILITY: re-persist the exact slot the patient
          // selected when the booking was created. This row is the single source
          // of truth for the confirmed appointment — we intentionally do NOT
          // re-derive the time from the doctor's current shiftStartTime /
          // shiftEndTime, so later admin schedule changes never shift an already
          // confirmed patient appointment.
          timeSlot: appointment.timeSlot,
          scheduledAt: appointment.scheduledAt,
        },
        include: {
          doctor: true,
          patient: true,
        },
      });

      // 4. Send an SMS confirmation to the patient's signup phone number.
      //    Best-effort only — a failing gateway must never fail the payment.
      try {
        await sendAppointmentConfirmationSms(updated, finalTrxId);
      } catch (e) {
        console.error('Failed to send appointment confirmation SMS:', e);
      }

      // 5. Real-time call event — ONLY when the consultation slot is open RIGHT
      //    NOW (5 min before slot start → slot duration end). Paying for a
      //    future appointment must NOT ping / pop the doctor's incoming-call
      //    modal. The patient initiates the call later, inside the slot window.
      try {
        const win = getConsultationWindow(
          updated.scheduledAt,
          updated.timeSlot,
          updated.doctor?.slotDuration
        );
        const inWindow = getConsultationWindowStatus(win) === 'open';

        if (inWindow) {
          await prisma.callEvent.create({
            data: {
              appointmentId: updated.id,
              doctorId: updated.doctorId,
              patientName: updated.patientName,
              type: 'PATIENT_WAITING',
              payload: JSON.stringify({
                timeSlot: updated.timeSlot,
                scheduledAt: updated.scheduledAt,
                phone: updated.patientPhone,
                trxID: finalTrxId,
                amount: updated.amountPaid,
                initiatedAt: new Date().toISOString(),
              }),
            },
          });
        } else {
          console.log(
            `[execute-payment] Skipped immediate call event for ${updated.id} — ` +
              `appointment slot (${updated.timeSlot}) is not currently open.`
          );
        }
      } catch (e) {
        console.error('Failed to create call event:', e);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment executed and verified successfully.',
        appointment: updated,
        trxID: finalTrxId,
        paymentID: bkashRes.paymentID,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment executed with bKash successfully.',
      trxID: finalTrxId,
      paymentID: bkashRes.paymentID,
    });
  } catch (error: any) {
    console.error('Error executing bKash payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment execution failed with bKash.',
      },
      { status: 500 }
    );
  }
}

