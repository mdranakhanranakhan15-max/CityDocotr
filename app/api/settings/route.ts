import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Homepage headline figures + the "Doctors Online" badge fall back to these
// values whenever nothing has been configured yet in the Admin Panel
// (Settings -> Site Stats & Metrics).
const DEFAULT_STATS = {
  patientsServed: '500K+',
  bmdcDoctors: '2,500+',
  satisfactionRate: '98.4%',
  onlineDoctors: '4+ Doctors Online',
};

// Maps the public config field name to the SiteSetting key + CMS label.
// The satisfaction storage key intentionally stays "stats.satisfaction" so
// rows written by earlier versions keep working after the field rename.
const KEYS: Record<string, { key: string; label: string }> = {
  patientsServed: { key: 'stats.patientsServed', label: 'Patients Served' },
  bmdcDoctors: { key: 'stats.bmdcDoctors', label: 'BMDC Doctors' },
  satisfactionRate: { key: 'stats.satisfaction', label: 'Satisfaction' },
  onlineDoctors: { key: 'stats.onlineDoctors', label: 'Doctors Online Badge' },
};

async function readStats() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(KEYS).map((k) => k.key) } },
  });
  const store: Record<string, string> = {};
  for (const row of rows) store[row.key] = row.value;

  return {
    patientsServed: store[KEYS.patientsServed.key] ?? DEFAULT_STATS.patientsServed,
    bmdcDoctors: store[KEYS.bmdcDoctors.key] ?? DEFAULT_STATS.bmdcDoctors,
    satisfactionRate: store[KEYS.satisfactionRate.key] ?? DEFAULT_STATS.satisfactionRate,
    onlineDoctors: store[KEYS.onlineDoctors.key] ?? DEFAULT_STATS.onlineDoctors,
  };
}

// GET /api/settings — return the CMS-controlled homepage stats & metrics.
// The no-store header (plus dynamic/revalidate = 0 above) guarantees the API
// itself is never cached, so the homepage always receives live DB values.
export async function GET() {
  try {
    const stats = await readStats();
    return NextResponse.json(
      { success: true, stats, defaults: DEFAULT_STATS },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/settings — persist the homepage stats & metrics from the Admin CMS.
// Accepts { patientsServed?, bmdcDoctors?, satisfactionRate?, onlineDoctors? }
// and upserts each provided value so the homepage reflects the change instantly.
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const updates: { key: string; value: string; label: string }[] = [];
    for (const [field, meta] of Object.entries(KEYS)) {
      const raw = body?.[field];
      if (raw !== undefined && String(raw).trim() !== '') {
        updates.push({ key: meta.key, value: String(raw).trim(), label: meta.label });
      }
    }

    for (const update of updates) {
      await prisma.siteSetting.upsert({
        where: { key: update.key },
        create: { key: update.key, value: update.value, label: update.label },
        update: { value: update.value, label: update.label },
      });
    }

    // Force Next.js / Vercel to clear the cached homepage immediately so the
    // new CMS values are served right away instead of stale build HTML.
    try {
      revalidatePath('/');
    } catch {
      // No-op outside a hosted/incremental-cache environment (e.g. dev).
    }

    const stats = await readStats();
    return NextResponse.json(
      {
        success: true,
        message: 'Site stats updated successfully',
        stats,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}