import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/symptoms/[id] — update title/image/department/order/isActive.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data: Record<string, any> = {};

    if (body?.title !== undefined) data.title = String(body.title).trim();
    if (body?.image !== undefined) data.image = body.image ? String(body.image).trim() : null;
    if (body?.order !== undefined) data.order = Number(body.order) || 0;
    if (body?.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body?.linkedDepartmentId !== undefined) {
      data.linkedDepartmentId = body.linkedDepartmentId ? String(body.linkedDepartmentId) : null;
    }

    const symptom = await prisma.symptom.update({ where: { id: params.id }, data });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true, symptom });
  } catch (error: any) {
    console.error('Error updating symptom:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update symptom' },
      { status: 500 }
    );
  }
}

// DELETE /api/symptoms/[id] — remove a symptom card.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.symptom.delete({ where: { id: params.id } });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting symptom:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete symptom' },
      { status: 500 }
    );
  }
}
