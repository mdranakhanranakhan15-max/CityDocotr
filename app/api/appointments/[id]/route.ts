import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/appointments/[id] - Fetch single appointment by ID
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: true,
        patient: true,
        prescription: true,
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error(`Error fetching appointment ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

// PATCH /api/appointments/[id] - Update status, paymentStatus, and notes
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: body.status !== undefined ? body.status.toUpperCase() : existing.status,
        paymentStatus:
          body.paymentStatus !== undefined
            ? body.paymentStatus.toUpperCase()
            : existing.paymentStatus,
        paymentMethod:
          body.paymentMethod !== undefined
            ? body.paymentMethod.toUpperCase()
            : existing.paymentMethod,
        transactionId:
          body.transactionId !== undefined ? body.transactionId : existing.transactionId,
        amountPaid:
          body.amountPaid !== undefined ? Number(body.amountPaid) : existing.amountPaid,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : existing.scheduledAt,
      },
      include: {
        doctor: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: updated,
    });
  } catch (error: any) {
    console.error(`Error updating appointment ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE /api/appointments/[id]
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Appointment not found' },
        { status: 404 }
      );
    }

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled/deleted successfully',
    });
  } catch (error: any) {
    console.error(`Error deleting appointment ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
