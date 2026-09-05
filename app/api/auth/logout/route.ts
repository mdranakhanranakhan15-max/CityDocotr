import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    response.cookies.delete('citydoctor_patient_token');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to log out' },
      { status: 500 }
    );
  }
}

