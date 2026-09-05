import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/doctors - List doctors with optional category, search, specialty, and sorting
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const specialty = searchParams.get('specialty');
    const status = searchParams.get('status');
    const isOnline = searchParams.get('isOnline');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy'); // 'relevance', 'fee_asc', 'fee_desc', 'rating', 'experience'

    const whereClause: any = {};

    // Category / Department slug or specialty match
    if (category && category !== 'all') {
      const normalizedCategory = category.toLowerCase().replace(/-/g, ' ');
      whereClause.OR = [
        { specialty: { contains: normalizedCategory } },
        { specialties: { contains: normalizedCategory } },
        { designation: { contains: normalizedCategory } },
      ];
    } else if (specialty && specialty !== 'All' && specialty !== 'All Specialties') {
      whereClause.OR = [
        { specialty: { contains: specialty } },
        { specialties: { contains: specialty } },
      ];
    }

    if (status && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    }

    if (isOnline !== null && isOnline !== undefined && isOnline !== '') {
      whereClause.isOnline = isOnline === 'true';
    }

    if (search) {
      const searchTerms = { contains: search };
      whereClause.OR = [
        { name: searchTerms },
        { specialty: searchTerms },
        { specialties: searchTerms },
        { workplace: searchTerms },
        { hospital: searchTerms },
        { designation: searchTerms },
        { degrees: searchTerms },
      ];
    }

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
        isOnline: onlineState,
        status: onlineState ? 'ONLINE' : 'OFFLINE',
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
