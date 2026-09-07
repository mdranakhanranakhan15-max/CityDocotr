import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Health Membership Plans API
 * GET  /api/health-plans   → public feed (isActive) or full list (?all=true)
 * POST /api/health-plans   → admin creates a membership plan
 *
 * `features` may be sent as a JSON array OR a newline-separated string.
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const plans = await prisma.healthPlan.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ popular: 'desc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({ success: true, plans });
  } catch (error: any) {
    console.error('Error fetching health plans:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch health plans', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, tagline, familyMembers, monthlyPrice, yearlyPrice, features, popular, isActive } = body || {};

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: 'Plan name is required' },
        { status: 400 }
      );
    }

    const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const int = (v: any, fallback = 1) => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 1 ? n : fallback;
    };

    const plan = await prisma.healthPlan.create({
      data: {
        name: String(name).trim(),
        tagline: tagline ? String(tagline).trim() : '',
        familyMembers: int(familyMembers),
        monthlyPrice: num(monthlyPrice),
        yearlyPrice: num(yearlyPrice),
        features: normalizeFeatures(features),
        popular: popular === undefined ? false : Boolean(popular),
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, plan }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating health plan:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create health plan', error: error.message },
      { status: 500 }
    );
  }
}
