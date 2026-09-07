import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Medicine [id] API — update (PATCH) or delete (DELETE) a single medicine.
 */
export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, category, brand, composition, form, imageUrl, regularPrice, discountedPrice, isActive } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Medicine id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.medicine.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Medicine not found' },
        { status: 404 }
      );
    }

    const num = (v: any, fallback: number) =>
      Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback;
    const regular = num(regularPrice, existing.regularPrice || 0);
    const discounted = num(discountedPrice, existing.discountedPrice || regular);

    const updated = await prisma.medicine.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() || existing.name : existing.name,
        category: category !== undefined ? String(category).trim() || 'General' : existing.category,
        brand: brand !== undefined ? String(brand).trim() : existing.brand,
        composition: composition !== undefined ? String(composition).trim() : existing.composition,
        form: form !== undefined ? String(form).trim() || 'Medicine' : existing.form,
        imageUrl: imageUrl !== undefined ? String(imageUrl).trim() : existing.imageUrl,
        regularPrice: regular,
        discountedPrice: discounted || regular,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, medicine: updated });
  } catch (error: any) {
    console.error('Error updating medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update medicine', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Medicine id is required' },
        { status: 400 }
      );
    }
    await prisma.medicine.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete medicine', error: error.message },
      { status: 500 }
    );
  }
}
