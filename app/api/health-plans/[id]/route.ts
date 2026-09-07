import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Membership Plan [id] API — update (PATCH) or delete (DELETE) a plan.
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
    const { name, tagline, familyMembers, monthlyPrice, yearlyPrice, features, popular, isActive } = body || {};

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Plan id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.healthPlan.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Health plan not found' },
        { status: 404 }
      );
    }

    const num = (v: any, fallback: number) =>
      Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback;
    const int = (v: any, fallback: number) => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 1 ? n : fallback;
    };

    const updated = await prisma.healthPlan.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() || existing.name : existing.name,
        tagline: tagline !== undefined ? String(tagline).trim() : existing.tagline,
        familyMembers: int(familyMembers, existing.familyMembers),
        monthlyPrice: num(monthlyPrice, existing.monthlyPrice),
        yearlyPrice: num(yearlyPrice, existing.yearlyPrice),
        features: features !== undefined ? normalizeFeatures(features) : existing.features,
        popular: popular !== undefined ? Boolean(popular) : existing.popular,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, plan: updated });
  } catch (error: any) {
    console.error('Error updating health plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update health plan', error: error.message },
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
        { success: false, message: 'Plan id is required' },
        { status: 400 }
      );
    }
    await prisma.healthPlan.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Health plan deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting health plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete health plan', error: error.message },
      { status: 500 }
    );
  }
}
