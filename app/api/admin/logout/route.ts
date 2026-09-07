import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/admin/logout — destroys the admin session cookie and clears any
// lingering auth cookies so the Admin Panel can be safely left.
export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Admin session destroyed. Logged out successfully',
    });

    // Destroy the admin session (if one is ever established) plus any stray
    // doctor / patient tokens so no identity lingers after signing out.
    response.cookies.delete('citydoctor_admin_token');
    response.cookies.delete('citydoctor_doctor_token');
    response.cookies.delete('citydoctor_patient_token');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to log out' },
      { status: 500 }
    );
  }
}