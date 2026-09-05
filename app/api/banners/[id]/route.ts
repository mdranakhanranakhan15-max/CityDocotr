import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/banners/[id] - Toggle isActive or update banner
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const updated = await prisma.heroBanner.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, banner: updated });
  } catch (error: any) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update banner', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/banners/[id] - Delete specific banner
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete banner', error: error.message },
      { status: 500 }
    );
  }
}

