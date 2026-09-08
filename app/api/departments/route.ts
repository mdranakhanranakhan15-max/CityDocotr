import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Defaults auto-seeded on first GET so the homepage is never empty.
const DEFAULT_DEPARTMENTS = [
  { title: 'General Physician', slug: 'general-physician', icon: 'Stethoscope', subtitle: 'Fever, flu & everyday illness' },
  { title: 'Gynaecology & Obs', slug: 'gynae-obs', icon: 'HeartPulse', subtitle: 'Women\u2019s health & pregnancy' },
  { title: 'Pediatrics (Child Care)', slug: 'pediatrics', icon: 'Baby', subtitle: 'Newborn to teen care' },
  { title: 'Dermatology (Skin & Hair)', slug: 'dermatology', icon: 'Sparkles', subtitle: 'Skin, hair & nail concerns' },
  { title: 'Cardiology (Heart)', slug: 'cardiology', icon: 'Heart', subtitle: 'Heart & blood pressure' },
  { title: 'Psychiatry & Mental Health', slug: 'psychiatry', icon: 'Smile', subtitle: 'Mental wellbeing support' },
  { title: 'Internal Medicine', slug: 'internal-medicine', icon: 'Activity', subtitle: 'Diabetes, gastric & more' },
  { title: 'Orthopedics (Bone & Joint)', slug: 'orthopedics', icon: 'Bone', subtitle: 'Bones, joints & injuries' },
  { title: 'Neurology (Brain & Nerve)', slug: 'neurology', icon: 'Brain', subtitle: 'Headache, migraine & nerves' },
  { title: 'Endocrinology & Diabetes', slug: 'endocrinology', icon: 'Activity', subtitle: 'Diabetes & hormones' },
];

// GET /api/departments — public list (active only) ordered for the homepage.
// Seeds the canonical departments on first call so the CMS is never empty.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    let departments = await prisma.department.findMany({
      where: all ? {} : { isActive: true },
      orderBy: { order: 'asc' },
    });

    if (!all && departments.length === 0) {
      await prisma.department.createMany({
        data: DEFAULT_DEPARTMENTS.map((d, i) => ({ ...d, order: i })),
      });
      departments = await prisma.department.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json(
      { success: true, departments },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST /api/departments — create a department from the Admin CMS.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }

    const slug = slugify(String(body?.slug || '') || title);
    const existing = await prisma.department.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: 'A department with this slug already exists' }, { status: 409 });
    }

    const max = await prisma.department.aggregate({ _max: { order: true } });
    const department = await prisma.department.create({
      data: {
        title,
        slug,
        subtitle: body?.subtitle ? String(body.subtitle).trim() : null,
        icon: body?.icon ? String(body.icon) : 'Stethoscope',
        order: Number.isFinite(Number(body?.order)) ? Number(body.order) : (max._max.order ?? -1) + 1,
        isActive: body?.isActive !== undefined ? Boolean(body.isActive) : true,
      },
    });

    try { revalidatePath('/'); } catch { /* dev no-op */ }

    return NextResponse.json({ success: true, department }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create department' },
      { status: 500 }
    );
  }
}
