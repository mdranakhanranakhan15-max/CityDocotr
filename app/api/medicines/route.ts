import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * CityDoctor Express Pharmacy — Medicine Catalogue API
 * GET  /api/medicines        → public feed (isActive) or full list (?all=true)
 * POST /api/medicines        → admin creates a medicine
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const category = searchParams.get('category');

    const where: any = all ? {} : { isActive: true };
    if (category && category !== 'All') where.category = category;

    const medicines = await prisma.medicine.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, medicines });
  } catch (error: any) {
    console.error('Error fetching medicines:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch medicines', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category,
      brand,
      composition,
      form,
      imageUrl,
      regularPrice,
      discountedPrice,
      isActive,
    } = body || {};

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: 'Medicine name is required' },
        { status: 400 }
      );
    }

    const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const regular = num(regularPrice);
    const discounted = num(discountedPrice);

    const medicine = await prisma.medicine.create({
      data: {
        name: String(name).trim(),
        category: category ? String(category).trim() : 'General',
        brand: brand ? String(brand).trim() : '',
        composition: composition ? String(composition).trim() : '',
        form: form ? String(form).trim() : 'Medicine',
        imageUrl: imageUrl ? String(imageUrl).trim() : '',
        regularPrice: regular,
        discountedPrice: discounted || regular,
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, medicine }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating medicine:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create medicine', error: error.message },
      { status: 500 }
    );
  }
}
