import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Homepage headline figures fall back to these values whenever nothing has been
// configured yet in the Admin Panel (Settings -> Site Stats & Metrics).
const DEFAULTS = {
  patientsServed: '500K+',
  bmdcDoctors: '2,500+',
  satisfaction: '98.4%',
};

// Maps the public config field name to the SiteSetting key/label.
const KEYS = {
  patientsServed: { key: 'hero.patientsServed', label: 'Patients Served' },
  bmdcDoctors: { key: 'hero.bmdcDoctors', label: 'BMDC Doctors' },
  satisfaction: { key: 'hero.satisfaction', label: 'Satisfaction' },
};

async function readConfig() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: Object.values(KEYS).map((k) => k.key) } },
  });
  const store: Record<string, string> = {};
  for (const row of rows) store[row.key] = row.value;

  return {
    patientsServed: store[KEYS.patientsServed.key] ?? DEFAULTS.patientsServed,
    bmdcDoctors: store[KEYS.bmdcDoctors.key] ?? DEFAULTS.bmdcDoctors,
    satisfaction: store[KEYS.satisfaction.key] ?? DEFAULTS.satisfaction,
  };
}

// GET /api/site-config — return the CMS-controlled homepage stats.
export async function GET() {
  try {
    const config = await readConfig();
    return NextResponse.json({ success: true, config, defaults: DEFAULTS });
  } catch (error: any) {
    console.error('Error fetching site config:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch site config' },
      { status: 500 }
    );
  }
}

// PUT /api/site-config — persist the homepage stats from the Admin Settings CMS.
// Accepts { patientsServed?, bmdcDoctors?, satisfaction? } and upserts each value.
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const updates: { key: string; value: string; label: string }[] = [];
    const queue = (field: string, meta: { key: string; label: string }) => {
      const raw = body?.[field];
      if (raw !== undefined && String(raw).trim() !== '') {
        updates.push({ key: meta.key, value: String(raw).trim(), label: meta.label });
      }
    };

    queue('patientsServed', KEYS.patientsServed);
    queue('bmdcDoctors', KEYS.bmdcDoctors);
    queue('satisfaction', KEYS.satisfaction);

    for (const update of updates) {
      await prisma.siteSetting.upsert({
        where: { key: update.key },
        create: { key: update.key, value: update.value, label: update.label },
        update: { value: update.value, label: update.label },
      });
    }

    const config = await readConfig();
    return NextResponse.json({ success: true, message: 'Site stats updated successfully', config });
  } catch (error: any) {
    console.error('Error saving site config:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save site config' },
      { status: 500 }
    );
  }
}