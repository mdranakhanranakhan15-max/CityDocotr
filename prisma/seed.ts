import { PrismaClient } from '@prisma/client';
import { hashPassword, hashPasswordBcrypt } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Telehealth database with DocTime-style doctors and banners...');

  // Clean existing data
  await prisma.heroBanner.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.admin.deleteMany();

  // Create Super Admin (default credentials: admin@doctime.com / Admin@123)
  const admin = await prisma.admin.create({
    data: {
      name: 'Dr. Alexander King',
      email: 'admin@doctime.com',
      role: 'SUPERADMIN',
      password: hashPasswordBcrypt('Admin@123'),
    },
  });
  console.log('Created Admin:', admin.email);

  // Create Hero Banners
  const bannersData = [
    {
      title: '1800+ Specialist And Experienced Doctors From Reputed Hospitals',
      subtitle: 'Get instant online video consultations anytime, anywhere with BMDC certified physicians.',
      imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=800',
      isActive: true,
    },
    {
      title: 'Doorstep Diagnostic Lab Tests & Health Checks in 24 Hours',
      subtitle: 'Certified phlebotomists collect blood samples at home with vacuum sterile tubes.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
      isActive: true,
    },
    {
      title: '24/7 Urgent Telehealth & AI Clinical Symptom Triage',
      subtitle: 'Connect with a verified physician in under 2 minutes for immediate treatment plans.',
      imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=800',
      isActive: true,
    },
  ];

  for (const b of bannersData) {
    await prisma.heroBanner.create({ data: b });
  }

  // Create Rich Doctor Profiles with all DocTime specification fields
  const doctorPasswordHash = hashPassword('password123');
  const doctorsData = [
    {
      id: 'doc-sarah-jenkins',
      name: 'Prof. Dr. Sarah Jenkins',
      email: 'doc-sarah-jenkins@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Senior Consultant & Head of Cardiology',
      degrees: 'MBBS, FCPS (Medicine), MD (Cardiology), FACC',
      specialty: 'Cardiology',
      specialties: 'Cardiology, Hypertension, Preventative Heart Care',
      workplace: 'National Institute of Cardiovascular Diseases (NICVD)',
      hospital: 'National Institute of Cardiovascular Diseases (NICVD)',
      education: 'Dhaka Medical College',
      experienceYears: 14,
      fee: 450,
      consultationFee: 450,
      rating: 5.0,
      totalVisits: 3283,
      reviewsCount: 412,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Specialist in preventative cardiology, hypertension management, echocardiography, and non-invasive cardiovascular diagnostics.',
      badge: 'Top Rated Cardiologist',
      isVerified: true,
    },
    {
      id: 'doc-marcus-vance',
      name: 'Dr. Marcus Vance',
      email: 'doc-marcus-vance@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Associate Professor (Dermatology & Venereology)',
      degrees: 'MBBS, DDV, FCPS (Dermatology)',
      specialty: 'Dermatology',
      specialties: 'Dermatology, Skin Allergy, Laser & Cosmetic Care',
      workplace: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
      hospital: 'Bangabandhu Sheikh Mujib Medical University (BSMMU)',
      education: 'Sir Salimullah Medical College',
      experienceYears: 11,
      fee: 350,
      consultationFee: 350,
      rating: 4.9,
      totalVisits: 2410,
      reviewsCount: 318,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Expert in clinical dermatology, adult acne, psoriasis, suspicious mole screening, and allergy-induced rashes.',
      badge: 'Super Fast Response',
      isVerified: true,
    },
    {
      id: 'doc-elena-rostova',
      name: 'Dr. Elena Rostova',
      email: 'doc-elena-rostova@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Consultant - Medicine & Family Health',
      degrees: 'MBBS, BCS (Health), FCPS (Internal Medicine)',
      specialty: 'General Physician',
      specialties: 'General Physician, Internal Medicine, Family Care',
      workplace: 'Dhaka Medical College Hospital',
      hospital: 'Dhaka Medical College Hospital',
      education: 'Dhaka Medical College',
      experienceYears: 16,
      fee: 320,
      consultationFee: 320,
      rating: 5.0,
      totalVisits: 5820,
      reviewsCount: 624,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Comprehensive primary health care, acute viral illnesses, metabolic health, preventative wellness, and chronic disease management.',
      badge: 'DocTime Gold Choice',
      isVerified: true,
    },
    {
      id: 'doc-david-chen',
      name: 'Dr. David Chen',
      email: 'doc-david-chen@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Assistant Professor (Neurology)',
      degrees: 'MBBS, MD (Neurology), MACP (USA)',
      specialty: 'Neurology',
      specialties: 'Neurology, Headache, Stroke & Nerve Disorders',
      workplace: 'National Institute of Neurosciences & Hospital (NINS)',
      hospital: 'National Institute of Neurosciences & Hospital (NINS)',
      education: 'Mymensingh Medical College',
      experienceYears: 18,
      fee: 500,
      consultationFee: 500,
      rating: 4.9,
      totalVisits: 1890,
      reviewsCount: 198,
      isOnline: false,
      status: 'OFFLINE',
      image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Specialized diagnostic workups for migraines, chronic neuropathic pain, memory disorders, and post-concussion recovery.',
      badge: 'Research Lead',
      isVerified: true,
    },
    {
      id: 'doc-maya-patel',
      name: 'Dr. Maya Patel',
      designation: 'Consultant Pediatrician & Neonatologist',
      degrees: 'MBBS, DCH, FCPS (Pediatrics)',
      specialty: 'Pediatrics',
      specialties: 'Pediatrics, Neonatal Care, Child Nutrition & Growth',
      workplace: 'Dhaka Shishu (Children) Hospital',
      hospital: 'Dhaka Shishu (Children) Hospital',
      education: 'Chittagong Medical College',
      experienceYears: 9,
      fee: 350,
      consultationFee: 350,
      rating: 5.0,
      totalVisits: 4120,
      reviewsCount: 510,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Compassionate pediatric care, infant nutrition, childhood developmental milestones, and acute respiratory infections.',
      badge: 'Child Care Expert',
      isVerified: true,
    },
    {
      id: 'doc-amara-okafor',
      name: 'Dr. Amara Okafor',
      email: 'doc-amara-okafor@citydoctor.com',
      password: doctorPasswordHash,
      designation: 'Assistant Professor (Orthopedics & Trauma)',
      degrees: 'MBBS, MS (Orthopedic Surgery)',
      specialty: 'Orthopedics',
      specialties: 'Orthopedic Surgery, Joint Pain, Arthritis & Sports Injury',
      workplace: 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)',
      hospital: 'National Institute of Traumatology and Orthopaedic Rehabilitation (NITOR)',
      education: 'Rajshahi Medical College',
      experienceYears: 12,
      fee: 400,
      consultationFee: 400,
      rating: 4.8,
      totalVisits: 2190,
      reviewsCount: 230,
      isOnline: false,
      status: 'OFFLINE',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Musculoskeletal pain triage, sports injury evaluations, joint stiffness, ergonomic workplace assessments, and posture correction.',
      badge: 'Sports Medicine',
      isVerified: true,
    },
    {
      id: 'doc-nusrat-zahan',
      name: 'Dr. Nusrat Zahan',
      designation: 'Consultant Obstetrician & Gynecologist',
      degrees: 'MBBS, FCPS (Obs & Gynae), MS',
      specialty: 'Gynae & Obs',
      specialties: 'Gynecology, Obstetrics, Infertility & High-Risk Pregnancy',
      workplace: 'BIRDEM General Hospital & Maternal Center',
      hospital: 'BIRDEM General Hospital & Maternal Center',
      education: 'Dhaka Medical College',
      experienceYears: 13,
      fee: 400,
      consultationFee: 400,
      rating: 5.0,
      totalVisits: 3740,
      reviewsCount: 460,
      isOnline: true,
      status: 'ONLINE',
      image: 'https://images.unsplash.com/photo-1594824813590-798b0304627d?auto=format&fit=crop&q=80&w=400',
      languages: 'English, Bengali',
      bio: 'Comprehensive gynecological care, prenatal screening, fertility counseling, menstrual disorders, and postnatal care.',
      badge: "Women's Health Expert",
      isVerified: true,
    }
  ];

  const scheduleDefaults = {
    availableDays: 'Sat, Sun, Mon, Tue',
    shiftStartTime: '10:00',
    shiftEndTime: '18:00',
    slotDuration: 15,
    maxPatientsPerSlot: 1,
    vatPercent: 5,
    platformFee: 29,
    doctorCommissionPercent: 80,
    isInstantCallAvailable: true,
    isOnVacation: false,
  };

  for (let i = 0; i < doctorsData.length; i++) {
    const doc = doctorsData[i];
    await prisma.doctor.create({
      data: {
        ...scheduleDefaults,
        bmdcRegNum: `A-${10000 + i * 173}/20${19 + (i % 5)}`,
        slotDuration: [10, 15, 20, 30, 15, 10, 20][i % 7],
        shiftStartTime: i % 2 === 0 ? '10:00' : '14:00',
        shiftEndTime: i % 2 === 0 ? '18:00' : '22:00',
        ...doc,
      },
    });
  }
  console.log(`Created ${doctorsData.length} doctors.`);

  // Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+880 1711-234567',
      age: 34,
      gender: 'Male',
    },
  });

  // Create Sample Appointment
  // scheduledAt is ~3 minutes from now so the demo dashboard shows an enabled
  // "Join Consultation Room" button (available from 5 minutes before the slot).
  const demoSlotDate = new Date(Date.now() + 1000 * 60 * 3);
  const demoAppointment = await prisma.appointment.create({
    data: {
      doctorId: doctorsData[0].id,
      patientId: patient1.id,
      patientName: 'John Smith',
      patientEmail: 'john.smith@example.com',
      patientPhone: '+880 1711-234567',
      symptoms: 'Mild chest pressure after jogging and elevated blood pressure reading (135/88).',
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'BKASH',
      transactionId: 'TRX-BKASH-8923',
      amountPaid: 450.0,
      timeSlot: `${demoSlotDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • ${demoSlotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      scheduledAt: demoSlotDate,
      meetingLink: `/consultation/${doctorsData[0].id}`,
      notes: 'Initial cardiac consultation. Patient has ECG records from last year.',
    },
  });
  console.log('Sample appointment:', demoAppointment.id);

  // ===== Marketplace CMS seed (Medicine Shop / Lab Tests / Health Plans) =====
  await prisma.medicine.deleteMany();
  await prisma.labTestPackage.deleteMany();
  await prisma.healthPlan.deleteMany();

  const medicinesSeed = [
    { name: 'Napa Extra', category: 'Fever & Pain', brand: 'Beximco Pharma', composition: 'Paracetamol 500mg + Caffeine 65mg', form: 'Tablet', imageUrl: '', regularPrice: 35, discountedPrice: 30 },
    { name: 'Seclo 20', category: 'Gastric & Acidity', brand: 'Square Pharma', composition: 'Omeprazole 20mg', form: 'Capsule', imageUrl: '', regularPrice: 75, discountedPrice: 65 },
    { name: 'Monas 10', category: 'Respiratory & Allergy', brand: 'Acme Laboratories', composition: 'Montelukast Sodium 10mg', form: 'Tablet', imageUrl: '', regularPrice: 180, discountedPrice: 160 },
    { name: 'Fexo 120', category: 'Allergy & Cold', brand: 'Renata Limited', composition: 'Fexofenadine HCl 120mg', form: 'Tablet', imageUrl: '', regularPrice: 105, discountedPrice: 90 },
    { name: 'Napa 500', category: 'Fever & Pain', brand: 'Beximco Pharma', composition: 'Paracetamol 500mg', form: 'Tablet', imageUrl: '', regularPrice: 25, discountedPrice: 20 },
    { name: 'Calbo-D3', category: 'Vitamins & Supplements', brand: 'Square Pharma', composition: 'Calcium 500mg + Vitamin D3', form: 'Tablet', imageUrl: '', regularPrice: 220, discountedPrice: 200 },
  ];
  for (const m of medicinesSeed) {
    await prisma.medicine.create({ data: m });
  }
  console.log('Seeded medicines:', medicinesSeed.length);

  const labPackagesSeed = [
    {
      title: 'Comprehensive Health Checkup',
      category: 'Full Body Screening',
      testsCount: 68,
      regularPrice: 3999,
      discountedPrice: 1999,
      popular: true,
      features: [
        'Free sample collection from your home',
        'NABL-accredited partner laboratories',
        'CBC, Lipid, HbA1c, LFT, KFT, Thyroid & Vitamin panels',
        'Digital report delivered within 24 hours',
      ],
    },
    {
      title: 'Disease Specific Panel',
      category: 'Diabetes & Thyroid',
      testsCount: 24,
      regularPrice: 1499,
      discountedPrice: 999,
      popular: false,
      features: [
        'Free sample collection from your home',
        'Diabetes & thyroid disease marker panel',
        'Digital report delivered within 24 hours',
      ],
    },
    {
      title: 'Heart Health Checkup',
      category: 'Cardiac Risk Profile',
      testsCount: 18,
      regularPrice: 1999,
      discountedPrice: 1499,
      popular: false,
      features: [
        'Free sample collection from your home',
        'Cardiac risk markers + ECG review',
        'Digital report delivered within 24 hours',
      ],
    },
  ];
  for (const p of labPackagesSeed) {
    await prisma.labTestPackage.create({ data: p });
  }
  console.log('Seeded lab packages:', labPackagesSeed.length);

  const healthPlansSeed = [
    {
      name: 'Individual Health Shield',
      tagline: 'Ideal for young professionals & individuals',
      familyMembers: 1,
      monthlyPrice: 249,
      yearlyPrice: 2490,
      popular: false,
      features: [
        '6 Free Video Consultations with General Physicians',
        '10% Flat Discount on all doorstep medicine orders',
        '15% Discount on all home diagnostic lab tests',
        'Digital health records vault with lifetime storage',
      ],
    },
    {
      name: 'DocTime Plus Care',
      tagline: 'Our most popular comprehensive healthcare package',
      familyMembers: 2,
      monthlyPrice: 499,
      yearlyPrice: 4990,
      popular: true,
      features: [
        'Unlimited Video Consultations with General Physicians',
        '4 Free Specialist Doctor Consultations per year',
        '15% Flat Discount on all medicines with free delivery',
        '25% Discount on home diagnostic lab tests',
        'Priority appointment scheduling & 24/7 hotline access',
      ],
    },
    {
      name: 'Family Total Protection',
      tagline: 'Complete medical safety net for parents and children',
      familyMembers: 5,
      monthlyPrice: 899,
      yearlyPrice: 8990,
      popular: false,
      features: [
        'Unlimited 24/7 video consultations with General Physicians',
        '10 Specialist Doctor consultations across all departments',
        'Covers up to 5 family members (Parents, Spouse & Children)',
        '20% Flat discount on all medicines with free delivery',
        'Digital health vault for the whole family',
      ],
    },
  ];
  for (const hp of healthPlansSeed) {
    await prisma.healthPlan.create({ data: hp });
  }
  console.log('Seeded health plans:', healthPlansSeed.length);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
