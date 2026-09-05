import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST /api/doctor/logout - Clear the doctor session cookie
export async function POST() {
  try {
    cookies().set('doctor_session', '', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Error during doctor logout:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
