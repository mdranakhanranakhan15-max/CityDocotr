import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Lab Test Packages API
 * GET  /api/lab-tests   → public feed (isActive) or full list (?all=true)
 * POST /api/lab-tests   → admin creates a diagnostic checkup package
 *
 * `features` may be sent as a JSON array OR a newline-separated string; both
 * are normalised into the String[] stored on the model.
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

    const packages = await prisma.labTestPackage.findMany({
      where: all ? {} : { isActive: true },
      orderBy: [{ popular: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ success: true, packages });
  } catch (error: any) {
    console.error('Error fetching lab test packages:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch lab test packages', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, testsCount, regularPrice, discountedPrice, features, popular, isActive } = body || {};

    if (!title || !String(title).trim()) {
      return NextResponse.json(
        { success: false, message: 'Package title is required' },
        { status: 400 }
      );
    }

    const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const int = (v: any, fallback = 1) => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) && n >= 0 ? n : fallback;
    };
    const regular = num(regularPrice);
    const discounted = num(discountedPrice);

    const pkg = await prisma.labTestPackage.create({
      data: {
        title: String(title).trim(),
        category: category ? String(category).trim() : 'Health Checkup',
        testsCount: int(testsCount),
        regularPrice: regular,
        discountedPrice: discounted || regular,
        features: normalizeFeatures(features),
        popular: popular === undefined ? false : Boolean(popular),
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, package: pkg }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lab test package:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create lab test package', error: error.message },
      { status: 500 }
    );
  }
}
