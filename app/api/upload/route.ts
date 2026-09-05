import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Whitelisted image formats (extension derived from the MIME type, never from
// the client-supplied file name so a `.html` / `.svg` cannot be smuggled in).
const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/heic': 'heic',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/upload
 * Multipart/form-data: { file: <image> }
 *
 * Stores the uploaded photo inside /public/uploads and returns the relative
 * public URL (e.g. "/uploads/doctor-1712345678901-ab12cd34.jpg") which callers
 * persist on the Doctor record via the profile / admin update routes.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No file uploaded. Field name must be "file".' },
        { status: 400 }
      );
    }

    if (typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: 'Invalid upload payload.' },
        { status: 400 }
      );
    }

    const uploaded = file as any;
    const mime = String(uploaded.type || '').toLowerCase();
    const ext = MIME_EXT[mime];

    if (!ext) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unsupported file type. Please upload a JPG, PNG, WebP, GIF, AVIF or HEIC image.',
        },
        { status: 415 }
      );
    }

    if (uploaded.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image is too large. Maximum allowed size is 5 MB.' },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await uploaded.arrayBuffer());
    const filename = `doctor-${Date.now()}-${randomBytes(8).toString('hex')}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json(
      { success: true, url: `/uploads/${filename}`, filename },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
