import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';

export const dynamic = 'force-dynamic';

// How long the generated OTP stays valid before a new one must be requested.
const OTP_TTL_MINUTES = 10;

/**
 * POST /api/auth/forgot-password  (self-service password recovery — step 1)
 * Body: { phone }
 *
 * 1. Looks the submitted phone up on the Patient record (404 when unknown).
 * 2. Generates a random 4-digit OTP and temporarily persists it (with an
 *    expiry) on the patient row via prisma.
 * 3. Sends the OTP through lib/sms.ts (mock console logger in dev, real
 *    Greenweb HTTP API once credentials are configured).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone || '').trim();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Please enter your registered mobile number.' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { phone },
      select: { id: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'No account found with this mobile number. Please sign up.' },
        { status: 404 }
      );
    }

    // Random 4-digit numeric code (1000–9999)
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Temporarily store the code + expiry so the reset step can verify it.
    // Cleared after a successful reset (see /api/auth/reset-password).
    await prisma.patient.update({
      where: { id: patient.id },
      data: { resetOtp: otp, resetOtpExpiresAt: expiresAt },
    });

    const smsResult = await sendSms({
      to: phone,
      message: `Your CityDoctor password reset OTP is ${otp}. It expires in ${OTP_TTL_MINUTES} minutes. Never share this code with anyone.`,
      template: 'PASSWORD_RESET_OTP',
    });

    return NextResponse.json({
      success: true,
      message: smsResult.success
        ? 'A 4-digit OTP has been sent to your mobile number via SMS.'
        : 'We could not deliver the SMS right now. Please try again in a moment.',
      expiresInMinutes: OTP_TTL_MINUTES,
    });
  } catch (error: any) {
    console.error('Error sending password reset OTP:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
