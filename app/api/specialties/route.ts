import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Canonical departments shown on the public landing page. Each slug maps to
// keyword tokens matched (case-insensitively) against a doctor's departmentSlug,
// specialty, specialties and designation so the displayed count reflects the
// REAL number of verified doctors available in the database.
const SPECIALTY_QUERIES: Record<string, string[]> = {
  'general-physician': ['general physician', 'internal medicine', 'medicine'],
  'gynae-obs': ['gynae', 'gynecolog', 'gynecology', 'obstetrics'],
  pediatrics: ['pediatric', 'paediatric', 'child'],
  dermatology: ['dermatolog', 'skin', 'hair'],
  cardiology: ['cardiolog', 'heart'],
  psychiatry: ['psychiatri', 'mental health', 'counseling'],
  'internal-medicine': ['internal medicine', 'medicine'],
  orthopedics: ['orthoped', 'orthopaed', 'bone', 'joint'],
  neurology: ['neurolog', 'brain', 'nerve'],
  endocrinology: ['endocrinolog', 'diabetes', 'hormone'],
};

// GET /api/specialties — real aggregated doctor counts per specialty from the DB.
export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        departmentSlug: true,
        specialty: true,
        specialties: true,
        designation: true,
      },
    });

    // Exact departmentSlug matches first (fast, uses the seeded slug).
    const bySlug: Record<string, number> = {};
    for (const doc of doctors) {
      const slug = (doc.departmentSlug || '').toLowerCase().trim();
      if (slug) bySlug[slug] = (bySlug[slug] || 0) + 1;
    }

    // Then fall back to fuzzy keyword matching for records with no slug.
    const counts: Record<string, number> = {};
    for (const [slug, tokens] of Object.entries(SPECIALTY_QUERIES)) {
      let count = bySlug[slug] || 0;
      if (count === 0) {
        count = doctors.filter((doc) => {
          const haystack = `${doc.departmentSlug || ''} ${doc.specialty || ''} ${doc.specialties || ''} ${doc.designation || ''}`
            .toLowerCase();
          const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ');
          const needle = norm(slug.replace(/-/g, ' '));
          if (haystack.includes(needle)) return true;
          return tokens.some((token) => haystack.includes(norm(token)));
        }).length;
      }
      counts[slug] = count;
    }

    return NextResponse.json({
      success: true,
      counts,
      total: doctors.length,
    });
  } catch (error: any) {
    console.error('Error computing specialty counts:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to compute specialty counts' },
      { status: 500 }
    );
  }
}