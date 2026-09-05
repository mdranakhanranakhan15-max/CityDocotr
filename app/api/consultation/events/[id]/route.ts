import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: { id: string };
}

// PATCH /api/consultation/events/[id] - Mark a notification as read/accepted
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await req.json();

    const existing = await prisma.callEvent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.callEvent.update({
      where: { id },
      data: {
        isRead: body.isRead !== undefined ? Boolean(body.isRead) : true,
        type: body.type !== undefined ? body.type : existing.type,
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (error: any) {
    console.error(`Error updating event ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update event' },
      { status: 500 }
    );
  }
}
