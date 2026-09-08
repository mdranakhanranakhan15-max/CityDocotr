import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Default symptom cards auto-seeded on first GET (matched to the homepage
// design). Each maps to a department slug so clicks land on the right doctor
// search page.
const DEFAULT_SYMPTOMS = [
  { title: 'Sexual problems', dept: 'dermatology' },
  { title: 'Period problems', dept: 'gynae-obs' },
  { title: 'Fever, Cold/Flu', dept: 'general-physician' },
  { title: 'Child diseases', dept: 'pediatrics' },
  { title: 'Pregnancy issues', dept: 'gynae-obs' },
  { title: 'Skin & Hair fall', dept: 'dermatology' },
  { title: 'Stomach & Digestion', dept: 'internal-medicine' },
  { title: 'Headache & Migraine', dept: 'neurology' },
  { title: 'Diabetes & Thyroid', dept: 'endocrinology' },
  { title: 'Joint & Back Pain', dept: 'orthopedics' },
];

// GET /api/symptoms — public list (active only) ordered for the homepage.
// Returns each symptom with its linked department slug for deep-linking.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let symptoms = await prisma.symptom.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { order: 'asc' },
      include: { department: { select: { slug: true, title: true } } },
    });

    if (!all && symptoms.length === 0) {
      const departments = await prisma.department.findMany({ select: { id: true, slug: true } });
      const bySlug: Record<string, string> = {};
      for (const d of departments) bySlug[d.slug] = d.id;

      await prisma.symptom.createMany({
        data: DEFAULT_SYMPTOMS.map((s, i) => ({
          title: s.title,
          slug: slugify(s.title),
          linkedDepartmentId: bySlug[s.dept] || null,
          order: i,
        })),
      });
      symptoms = await prisma.symptom.findMany({
        orderBy: { order: 'asc' },
        include: { department: { select: { slug: true, title: true } } },
      });
    }

    return NextResponse.json(
      {
        success: true,
        symptoms: symptoms.map((s) => ({
          ...s,
          departmentSlug: s.department?.slug || null,
          departmentTitle: s.department?.title || null,
        })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error fetching symptoms:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch symptoms' },
      { status: 500 }
    );
  }
}

// POST /api/symptoms — create a symptom card from the Admin CMS.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const slug = slugify(String(body?.slug || '') || title);
    const existing = await prisma.symptom.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A symptom with this slug already exists' }, { status: 409 });
    }

    const max = await prisma.symptom.aggregate({ _max: { order: true } });
    const symptom = await prisma.symptom.create({
      data: {
        title,
        slug,
        image: body?.image ? String(body.image).trim() : null,
        linkedDepartmentId: body?.linkedDepartmentId ? String(body.linkedDepartmentId) : null,
        order: Number.isFinite(Number(body?.order)) ? Number(body.order) : (max._max.order ?? -1) + 1,
        isActive: body?.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true, symptom }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating symptom:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create symptom' },
      { status: 500 }
    );
  }
}
