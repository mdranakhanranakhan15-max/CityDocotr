import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/banners - Fetch active or all hero banners
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    const where = all === 'true' ? {} : { isActive: true };

    const banners = await prisma.heroBanner.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error('Error fetching hero banners:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero banners', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/banners - Create a new hero banner
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, title, subtitle, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, message: 'imageUrl is required' },
        { status: 400 }
      );
    }

    const banner = await prisma.heroBanner.create({
      data: {
        imageUrl,
        title: title || '1800+ Specialist And Experienced Doctors From Reputed Hospitals',
        subtitle: subtitle || 'Get instant online video consultations anytime, anywhere with BMDC certified physicians.',
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, banner }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hero banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create hero banner', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/banners - Delete banner by id from URL query
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Banner id is required' },
        { status: 400 }
      );
    }

    await prisma.heroBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting hero banner:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete hero banner', error: error.message },
      { status: 500 }
    );
  }
}

