import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// PUT /api/departments/[id] — update title/subtitle/icon/slug/order/isActive.
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const data: Record<string, any> = {};

    if (body?.title !== undefined) data.title = String(body.title).trim();
    if (body?.subtitle !== undefined) data.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    if (body?.icon !== undefined) data.icon = String(body.icon);
    if (body?.order !== undefined) data.order = Number(body.order) || 0;
    if (body?.isActive !== undefined) data.isActive = Boolean(body.isActive);
    if (body?.slug !== undefined) {
      data.slug = String(body.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const department = await prisma.department.update({ where: { id: params.id }, data });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true, department });
  } catch (error: any) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE /api/departments/[id] — remove a department (symptoms are unlinked).
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.symptom.updateMany({
      where: { linkedDepartmentId: params.id },
      data: { linkedDepartmentId: null },
    });
    await prisma.department.delete({ where: { id: params.id } });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete department' },
      { status: 500 }
    );
  }
}
