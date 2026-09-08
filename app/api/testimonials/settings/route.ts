import { GET as reviewsSettingsGET, PUT as reviewsSettingsPUT } from '../../reviews/settings/route';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// /api/testimonials/settings — naming alias for /api/reviews/settings so CMS
// documentation/tooling that references the "testimonials" endpoint works too.
// GET  → testimonial section header config + live published review count.
// PUT  → persists Section Title / Section Subtitle / count mode and calls
//        revalidatePath('/') so changes appear on the homepage immediately.
export const GET = reviewsSettingsGET;
export const PUT = reviewsSettingsPUT;
