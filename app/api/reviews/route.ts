import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Guarantee the CityDoctor brand is never shown as "DocTime" in any review text.
function rebrand(text: string): string {
  return String(text || '').replace(/DocTime/gi, 'CityDoctor');
}

// Normalise a 1-5 rating (clamped) so bad input can never produce an invalid star row.
function toRating(value: any, fallback = 5): number {
  const n = Math.floor(Number(value));
  if (Number.isFinite(n)) return Math.max(1, Math.min(5, n));
  return fallback;
}

// Public-facing shape used by the homepage testimonial grid. `place` is built from
// location + service so the renderer keeps its existing "Uttara, Dhaka • Pediatrics"
// style without touching any markup.
function toPublic(review: any) {
  return {
    id: review.id,
    quote: rebrand(review.text),
    name: review.name,
    place:
      review.service && String(review.service).trim()
        ? `${review.location} • ${review.service}`
        : review.location,
    rating: review.rating,
    location: review.location,
    service: review.service,
    isActive: review.isActive,
  };
}

// GET /api/reviews — public feed (active only) or, with ?all=true, the full list
// for the Admin Reviews Management page. Also seeds from the built-in fallbacks
// so a brand-new database always shows a few testimonials.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const reviews = await prisma.patientReview.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    // Seed the fallback testimonials into MongoDB on first ever call so the
    // public grid is never empty before the admin adds reviews.
    if (reviews.length === 0) {
      const seeds = [
        {
          name: 'Shahrin Sultana',
          location: 'Uttara, Dhaka',
          text: '“CityDoctor is a lifesaver for our family. When my 4-year-old had sudden midnight fever, Dr. Rafiqul was online within 6 minutes. The e-prescription was clear and medicine arrived in the morning.”',
          rating: 5,
          service: 'Pediatrics Consultation',
        },
        {
          name: 'Tanmoy Bhowmick',
          location: 'Sylhet Sadar',
          text: '“Living outside Dhaka, getting an appointment with a BSMMU doctor used to take weeks. With CityDoctor, we consulted Prof. Mahmudul Alam for my mother’s cardiac checkup right from our living room.”',
          rating: 5,
          service: 'Cardiology Review',
        },
        {
          name: 'Mahmudur Rahman',
          location: 'Gulshan, Dhaka',
          text: '“The home sample collection service for diabetes checkup was so seamless. Phlebotomist came at 7:30 AM in PPE, and I received digital reports by 6 PM. Highly recommended!”',
          rating: 5,
          service: 'Executive Full Body Checkup',
        },
      ];
      for (const seed of seeds) {
        await prisma.patientReview.create({ data: seed });
      }
      const seeded = await prisma.patientReview.findMany({
        where: all ? {} : { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ success: true, reviews: seeded });
    }

    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch reviews', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/reviews — admin creates a new patient review/testimonial.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, location, text, rating, service, isActive } = body || {};

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        { success: false, message: 'Patient name is required' },
        { status: 400 }
      );
    }
    if (!text || !String(text).trim()) {
      return NextResponse.json(
        { success: false, message: 'Review text is required' },
        { status: 400 }
      );
    }

    const review = await prisma.patientReview.create({
      data: {
        name: String(name).trim(),
        location: location ? String(location).trim() : '',
        text: rebrand(String(text).trim()),
        rating: toRating(rating, 5),
        service: service ? String(service).trim() : '',
        isActive: isActive === undefined ? true : Boolean(isActive),
      },
    });

    // Publish the new testimonial to the homepage cache immediately.
    try {
      revalidatePath('/');
    } catch {
      // No-op outside a hosted/incremental-cache environment (e.g. dev).
    }

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create review', error: error.message },
      { status: 500 }
    );
  }
}