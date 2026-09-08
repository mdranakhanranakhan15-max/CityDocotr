import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Testimonial section header config for the homepage testimonials grid.
// Stored as flat SiteSetting key/value rows (Admin -> Reviews -> Section Settings),
// mirroring how the homepage stats are managed in app/api/settings/route.ts.
const KEYS = {
  title: 'reviews.title', // Main heading. Supports the {count} placeholder token.
  subtitle: 'reviews.subtitle', // Small uppercase eyebrow shown above the heading.
  countMode: 'reviews.countMode', // 'auto' (live DB count) or 'custom' (customCount text)
  customCount: 'reviews.customCount', // Custom display value e.g. "500,000+"
} as const;

const LABELS: Record<string, string> = {
  [KEYS.title]: 'Testimonial Section Title',
  [KEYS.subtitle]: 'Testimonial Section Subtitle',
  [KEYS.countMode]: 'Testimonial Count Mode',
  [KEYS.customCount]: 'Testimonial Custom Count',
};

// Values the Reviews CMS form is pre-filled with until the admin saves their
// own copy. These mirror the homepage's built-in English marketing headings.
// (They are NOT injected into the homepage automatically — empty DB values keep
// the site's built-in bilingual copy, which already reads identically in EN.)
const DISPLAY_DEFAULTS = {
  title: 'Loved by Over 500,000+ Patients',
  subtitle: 'VERIFIED PATIENT EXPERIENCES',
  countMode: 'auto',
  customCount: '',
};

async function readConfig() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(KEYS) } },
  });
  const store: Record<string, string> = {};
  for (const row of rows) store[row.key] = row.value;

  // Real number of reviews currently published to the homepage. Used as the
  // automatic count (countMode = "auto") and shown live in the Admin CMS.
  const activeCount = await prisma.patientReview.count({ where: { isActive: true } });

  return {
    config: {
      title: store[KEYS.title] ?? '',
      subtitle: store[KEYS.subtitle] ?? '',
      countMode: store[KEYS.countMode] === 'custom' ? 'custom' : 'auto',
      customCount: store[KEYS.customCount] ?? '',
    },
    activeCount,
  };
}

// GET /api/reviews/settings — return the CMS-controlled testimonial section
// header config plus the live published review count. Never cached so the
// Admin page always shows current values.
export async function GET() {
  try {
    const data = await readConfig();
    return NextResponse.json(
      { success: true, ...data, defaults: DISPLAY_DEFAULTS },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error fetching review section settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch review section settings', error: error?.message },
      { status: 500 }
    );
  }
}

// PUT /api/reviews/settings — persist the testimonial section header settings
// (title, subtitle, count source + custom number) from the Admin Reviews CMS
// and force Next.js to serve the updated homepage immediately.
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, countMode, customCount } = body || {};

    const updates: { key: string; value: string; label: string }[] = [];

    if (title !== undefined) {
      updates.push({ key: KEYS.title, value: String(title).trim(), label: LABELS[KEYS.title] });
    }
    if (subtitle !== undefined) {
      updates.push({
        key: KEYS.subtitle,
        value: String(subtitle).trim(),
        label: LABELS[KEYS.subtitle],
      });
    }
    if (countMode !== undefined) {
      const mode = countMode === 'custom' ? 'custom' : 'auto';
      updates.push({ key: KEYS.countMode, value: mode, label: LABELS[KEYS.countMode] });
    }
    if (customCount !== undefined && (countMode === undefined || countMode === 'custom')) {
      updates.push({
        key: KEYS.customCount,
        value: String(customCount).trim(),
        label: LABELS[KEYS.customCount],
      });
    }

    for (const update of updates) {
      await prisma.siteSetting.upsert({
        where: { key: update.key },
        create: { key: update.key, value: update.value, label: update.label },
        update: { value: update.value, label: update.label },
      });
    }

    // Force the cached homepage to refresh immediately so the new heading /
    // subtitle / count reach visitors on the next load instead of stale HTML.
    try {
      revalidatePath('/');
    } catch {
      // No-op outside a hosted/incremental-cache environment (e.g. dev).
    }

    const data = await readConfig();
    return NextResponse.json(
      {
        success: true,
        message: 'Testimonial section settings updated successfully',
        ...data,
        defaults: DISPLAY_DEFAULTS,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error saving review section settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save review section settings', error: error?.message },
      { status: 500 }
    );
  }
}
