import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  hashPasswordBcrypt,
  passwordMatches,
  verifyPatientSessionToken,
  verifySessionToken,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

const PASSWORD_MIN_LENGTH = 4;

const json = (status: number, error: string) =>
  NextResponse.json({ success: false, error }, { status });

/**
 * Unified password change endpoint for every role.
 *
 * Authentication:
 *  - PATIENT  → signed `citydoctor_patient_token` cookie
 *  - DOCTOR   → signed `doctor_session` cookie
 *  - ADMIN    → explicit { role: 'ADMIN', email } (no admin session cookie exists yet)
 *
 * The current password is verified against the stored credential (scrypt,
 * bcrypt or legacy plain text via passwordMatches) and the new password is
 * hashed with bcrypt before being persisted.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { currentPassword, newPassword, role, email } = body || {};

    if (!currentPassword || !newPassword) {
      return json(400, 'Current password and new password are required.');
    }
    if (String(newPassword).length < PASSWORD_MIN_LENGTH) {
      return json(
        400,
        `New password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
      );
    }
    if (currentPassword === newPassword) {
      return json(400, 'New password must be different from your current password.');
    }

    const cookieStore = cookies();
    const patientToken = cookieStore.get('citydoctor_patient_token')?.value;
    const doctorToken = cookieStore.get('doctor_session')?.value;

    // ---- PATIENT ----
    if (patientToken) {
      const patientId = verifyPatientSessionToken(patientToken);
      if (!patientId) return json(401, 'Session expired. Please log in again.');

      const patient = await prisma.patient.findUnique({ where: { id: patientId } });
      if (!patient) return json(404, 'Patient account not found.');

      if (!passwordMatches(String(currentPassword), patient.password || '')) {
        return json(400, 'Current password is incorrect.');
      }

      await prisma.patient.update({
        where: { id: patient.id },
        data: { password: hashPasswordBcrypt(String(newPassword)) },
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
        role: 'PATIENT',
      });
    }

    // ---- DOCTOR ----
    if (doctorToken) {
      const doctorId = verifySessionToken(doctorToken);
      if (!doctorId) return json(401, 'Session expired. Please log in again.');

      const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
      if (!doctor) return json(404, 'Doctor account not found.');

      if (!passwordMatches(String(currentPassword), doctor.password || '')) {
        return json(400, 'Current password is incorrect.');
      }

      await prisma.doctor.update({
        where: { id: doctor.id },
        data: { password: hashPasswordBcrypt(String(newPassword)) },
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
        role: 'DOCTOR',
      });
    }

    // ---- ADMIN (no admin session exists yet → verify by email) ----
    if (String(role || '').toUpperCase() === 'ADMIN') {
      const adminEmail = String(email || '').trim().toLowerCase();
      if (!adminEmail) {
        return json(400, 'Admin email is required to change the admin password.');
      }

      const admin = await prisma.admin.findUnique({ where: { email: adminEmail } });
      if (!admin) return json(404, 'Admin account not found.');

      if (!admin.password) {
        return json(
          400,
          'No password is set for this admin yet. Please seed or set one first.'
        );
      }
      if (!passwordMatches(String(currentPassword), admin.password)) {
        return json(400, 'Current password is incorrect.');
      }

      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashPasswordBcrypt(String(newPassword)) },
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.',
        role: 'ADMIN',
      });
    }

    return json(401, 'You must be signed in to change your password.');
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
