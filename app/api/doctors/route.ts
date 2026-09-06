import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

/** "Cardiology" -> "cardiology"; "Gynae & Obs" -> "gynae-obs". */
function toDepartmentSlug(value?: string | null): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/doctors - List doctors with optional category (department slug),
// specialty, search, status, isOnline, isApproved, and sorting.
//
// MongoDB (Prisma) string matching is case-sensitive by default, so every text
// filter below uses `mode: 'insensitive'`. Without this, /department/cardiology
// never matched doctors whose specialty is stored as "Cardiology".
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const specialty = searchParams.get('specialty');
    const status = searchParams.get('status');
    const isOnline = searchParams.get('isOnline');
    const isApproved = searchParams.get('isApproved');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy'); // 'relevance', 'fee_asc', 'fee_desc', 'rating', 'experience'

    const whereClause: any = {};
    const OR: any[] = [];

    // Category / Department slug or specialty match — case-insensitive.
    // e.g. /department/cardiology  -> specialty "Cardiology" / departmentSlug "cardiology"
    //      /department/gynae-obs   -> specialty "Gynae & Obs" / departmentSlug "gynae-obs"
    if (category && category !== 'all') {
      const categorySlug = category
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      OR.push({ departmentSlug: { equals: categorySlug, mode: 'insensitive' } });
      OR.push({ specialty: { equals: category, mode: 'insensitive' } });

      // Token fallback so punctuation differences ("&" vs "and" vs "-") never
      // hide a department's doctors.
      const tokens = category.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      for (const token of tokens) {
        OR.push({ specialty: { contains: token, mode: 'insensitive' } });
        OR.push({ specialties: { contains: token, mode: 'insensitive' } });
        OR.push({ designation: { contains: token, mode: 'insensitive' } });
      }
    } else if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      // Admin / directory specialty filter — exact + fuzzy, case-insensitive.
      OR.push({ specialty: { equals: specialty, mode: 'insensitive' } });
      OR.push({ specialty: { contains: specialty, mode: 'insensitive' } });
      OR.push({ specialties: { contains: specialty, mode: 'insensitive' } });
    }

    // Status filter — tolerant fallback. Imported doctors are stored with
    // status "ACTIVE"; records that predate that convention (ONLINE/OFFLINE)
    // are treated as the same "active doctor" group instead of being hidden.
    if (status && status.trim() !== '' && status.toUpperCase() !== 'ALL') {
      const normalizedStatus = status.toUpperCase();
      if (
        normalizedStatus === 'ONLINE' ||
        normalizedStatus === 'ACTIVE' ||
        normalizedStatus === 'AVAILABLE'
      ) {
        whereClause.status = {
          in: ['ACTIVE', 'ONLINE', 'AVAILABLE', 'active', 'online', 'available'],
        };
      } else if (normalizedStatus === 'OFFLINE' || normalizedStatus === 'INACTIVE') {
        whereClause.status = {
          in: ['OFFLINE', 'INACTIVE', 'offline', 'inactive'],
        };
      }
      // Unknown statuses intentionally do not restrict results (fallback) so a
      // stray "status=ACTIVE" request can never return an empty directory.
    }

    // isApproved — only records explicitly flagged false are excluded. Doctors
    // imported before the flag existed remain visible ({ not: false } fallback).
    if (
      isApproved !== null &&
      isApproved !== undefined &&
      isApproved !== '' &&
      isApproved.toLowerCase() !== 'all'
    ) {
      const wantsApproved = !['0', 'false', 'no', 'unapproved'].includes(
        isApproved.toLowerCase()
      );
      whereClause.isApproved = wantsApproved ? { not: false } : false;
    }

    if (isOnline !== null && isOnline !== undefined && isOnline !== '') {
      whereClause.isOnline = isOnline === 'true';
    }

    // Free-text search across the doctor profile — case-insensitive.
    if (search && search.trim() !== '') {
      const term = search.trim();
      OR.push({ name: { contains: term, mode: 'insensitive' } });
      OR.push({ specialty: { contains: term, mode: 'insensitive' } });
      OR.push({ specialties: { contains: term, mode: 'insensitive' } });
      OR.push({ workplace: { contains: term, mode: 'insensitive' } });
      OR.push({ hospital: { contains: term, mode: 'insensitive' } });
      OR.push({ designation: { contains: term, mode: 'insensitive' } });
      OR.push({ degrees: { contains: term, mode: 'insensitive' } });
    }

    if (OR.length > 0) whereClause.OR = OR;

    // Sorting
    let orderBy: any[] = [{ isOnline: 'desc' }, { rating: 'desc' }];
    if (sortBy === 'fee_asc') {
      orderBy = [{ fee: 'asc' }];
    } else if (sortBy === 'fee_desc') {
      orderBy = [{ fee: 'desc' }];
    } else if (sortBy === 'rating') {
      orderBy = [{ rating: 'desc' }];
    } else if (sortBy === 'experience') {
      orderBy = [{ experienceYears: 'desc' }];
    } else if (sortBy === 'visits') {
      orderBy = [{ totalVisits: 'desc' }];
    }

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      orderBy,
      include: {
        _count: {
          select: { appointments: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error: any) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

// POST /api/doctors - Create a new doctor profile (Admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      designation,
      degrees,
      specialty,
      specialties,
      workplace,
      hospital,
      education,
      experienceYears,
      fee,
      consultationFee,
      isOnline,
      status,
      image,
      bio,
      languages,
      badge,
      rating,
      totalVisits,
      email,
      password,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is a required field.' },
        { status: 400 }
      );
    }

    // Doctor portal login credentials (created by Admin)
    let hashedPassword: string | undefined;
    if (email && password) {
      hashedPassword = hashPassword(password);
    } else if (email && !password) {
      return NextResponse.json(
        { success: false, error: 'A password is required when setting a login email.' },
        { status: 400 }
      );
    }

    const doctorFee = Number(fee || consultationFee) || 350;
    const onlineState = isOnline !== undefined ? Boolean(isOnline) : true;

    const newDoctor = await prisma.doctor.create({
      data: {
        name,
        designation: designation || 'Consultant Specialist',
        degrees: degrees || 'MBBS, FCPS',
        specialty: specialty || 'General Physician',
        specialties: specialties || specialty || 'General Physician',
        workplace: workplace || hospital || 'Dhaka Medical College Hospital',
        hospital: hospital || workplace || 'Dhaka Medical College Hospital',
        education: education || 'Dhaka Medical College',
        experienceYears: Number(experienceYears) || 5,
        fee: doctorFee,
        consultationFee: doctorFee,
        rating: Number(rating) || 5.0,
        totalVisits: Number(totalVisits) || 0,
        email: email ? email.toLowerCase().trim() : null,
        password: hashedPassword || null,
        departmentSlug:
          body.departmentSlug || toDepartmentSlug(specialty || specialties || 'General Physician'),
        isOnline: onlineState,
        status: 'ACTIVE', // approved & listed; live presence is tracked via isOnline
        isApproved: true,
        image:
          image ||
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
        bio: bio || `Specialist physician in ${specialty || 'General Medicine'}. Dedicated to compassionate patient care.`,
        languages: languages || 'English, Bengali',
        badge: badge || 'Verified Physician',
        isVerified: true,
      },
    });

    return NextResponse.json(
      { success: true, message: 'Doctor profile created successfully', doctor: newDoctor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating doctor:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create doctor profile' },
      { status: 500 }
    );
  }
}
