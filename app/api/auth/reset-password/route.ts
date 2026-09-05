import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/reset-password  (self-service password recovery — step 2)
 * Body: { phone, otp, password }
 *
 * 1. Verifies the submitted OTP against the temporary code stored by
 *    /api/auth/forgot-password (and that it has not expired yet).
 * 2. Hashes the new password (scrypt via lib/auth.ts).
 * 3. Updates the patient record and clears the temporary OTP fields so a
 *    used/expired code can never be replayed.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const phone = String(body?.phone || '').trim();
    const otp = String(body?.otp || '').trim();
    const password = String(body?.password || '');

    if (!phone || !otp || !password) {
      return NextResponse.json(
        { success: false, error: 'Phone number, OTP, and new password are required.' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be the 4-digit code sent to your mobile.' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    const patient = await prisma.patient.findFirst({
      where: { phone },
      select: { id: true, resetOtp: true, resetOtpExpiresAt: true },
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'No account found with this mobile number.' },
        { status: 404 }
      );
    }

    if (!patient.resetOtp || patient.resetOtp !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please check the code and try again.' },
        { status: 400 }
      );
    }

    if (!patient.resetOtpExpiresAt || patient.resetOtpExpiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'This OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiresAt: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. Please sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Error resetting patient password:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
