import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Guarantee the CityDoctor brand is never shown as "DocTime" in any review text.
function rebrand(text: string): string {
  return String(text || '').replace(/DocTime/gi, 'CityDoctor');
}

function toRating(value: any, fallback: number): number {
  const n = Math.floor(Number(value));
  if (Number.isFinite(n)) return Math.max(1, Math.min(5, n));
  return fallback;
}

// PATCH /api/reviews/[id] — admin edits an existing review/testimonial.
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Review id is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.patientReview.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, location, text, rating, service, isActive } = body || {};

    const updated = await prisma.patientReview.update({
      where: { id },
      data: {
        name:
          name !== undefined && String(name).trim()
            ? String(name).trim()
            : existing.name,
        location:
          location !== undefined ? String(location).trim() : existing.location,
        text: text !== undefined ? rebrand(String(text).trim()) : existing.text,
        rating: rating !== undefined ? toRating(rating, existing.rating) : existing.rating,
        service:
          service !== undefined ? String(service).trim() : existing.service,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update review', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] — admin deletes a review/testimonial.
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Review id is required' },
        { status: 400 }
      );
    }
    await prisma.patientReview.delete({ where: { id } });
    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete review', error: error.message },
      { status: 500 }
    );
  }
}