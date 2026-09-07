import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Lab Test Package [id] API — update (PATCH) or delete (DELETE) a package.
 * Supports the same `features` array / newline-string formats as POST.
 */
export const dynamic = 'force-dynamic';

function normalizeFeatures(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map((f) => String(f).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\r?\n|•|,/)
      .map((f) => f.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }
  return [];
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, category, testsCount, regularPrice, discountedPrice, features, popular, isActive } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Package id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.labTestPackage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Lab test package not found' },
        { status: 404 }
      );
    }

    const num = (v: any, fallback: number) =>
      Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback;
    const int = (v: any, fallback: number) => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    const regular = num(regularPrice, existing.regularPrice || 0);
    const discounted = num(discountedPrice, existing.discountedPrice || regular);

    const updated = await prisma.labTestPackage.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title).trim() || existing.title : existing.title,
        category:
          category !== undefined ? String(category).trim() || 'Health Checkup' : existing.category,
        testsCount: int(testsCount, existing.testsCount),
        regularPrice: regular,
        discountedPrice: discounted || regular,
        features:
          features !== undefined ? normalizeFeatures(features) : existing.features,
        popular: popular !== undefined ? Boolean(popular) : existing.popular,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error: any) {
    console.error('Error updating lab test package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update lab test package', error: error.message },
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
        { success: false, message: 'Package id is required' },
        { status: 400 }
      );
    }
    await prisma.labTestPackage.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Lab test package deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lab test package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete lab test package', error: error.message },
      { status: 500 }
    );
  }
}
