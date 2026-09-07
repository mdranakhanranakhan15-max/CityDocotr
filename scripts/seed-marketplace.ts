/**
 * Seed ONLY the Marketplace CMS collections (Medicine, LabTestPackage,
 * HealthPlan). Safe to run repeatedly — it wipes and recreates just these
 * three collections and never touches doctors / patients / appointments.
 *
 * Usage: npm run db:marketplace
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Marketplace CMS (medicines, lab tests, health plans)...');

  await prisma.medicine.deleteMany();
  await prisma.labTestPackage.deleteMany();
  await prisma.healthPlan.deleteMany();

  const medicines = [
    { name: 'Napa Extra', category: 'Fever & Pain', brand: 'Beximco Pharma', composition: 'Paracetamol 500mg + Caffeine 65mg', form: 'Tablet', imageUrl: '', regularPrice: 35, discountedPrice: 30 },
    { name: 'Seclo 20', category: 'Gastric & Acidity', brand: 'Square Pharma', composition: 'Omeprazole 20mg', form: 'Capsule', imageUrl: '', regularPrice: 75, discountedPrice: 65 },
    { name: 'Monas 10', category: 'Respiratory & Allergy', brand: 'Acme Laboratories', composition: 'Montelukast Sodium 10mg', form: 'Tablet', imageUrl: '', regularPrice: 180, discountedPrice: 160 },
    { name: 'Fexo 120', category: 'Allergy & Cold', brand: 'Renata Limited', composition: 'Fexofenadine HCl 120mg', form: 'Tablet', imageUrl: '', regularPrice: 105, discountedPrice: 90 },
    { name: 'Napa 500', category: 'Fever & Pain', brand: 'Beximco Pharma', composition: 'Paracetamol 500mg', form: 'Tablet', imageUrl: '', regularPrice: 25, discountedPrice: 20 },
    { name: 'Calbo-D3', category: 'Vitamins & Supplements', brand: 'Square Pharma', composition: 'Calcium 500mg + Vitamin D3', form: 'Tablet', imageUrl: '', regularPrice: 220, discountedPrice: 200 },
    { name: 'Alatrol 10', category: 'Allergy & Cold', brand: 'Incepta Pharma', composition: 'Cetirizine HCl 10mg', form: 'Tablet', imageUrl: '', regularPrice: 20, discountedPrice: 15 },
    { name: 'Maxpro 20', category: 'Gastric & Acidity', brand: 'Healthcare Pharma', composition: 'Pantoprazole 20mg', form: 'Tablet', imageUrl: '', regularPrice: 85, discountedPrice: 70 },
  ];
  for (const m of medicines) await prisma.medicine.create({ data: m });
  console.log('Medicines:', medicines.length);

  const labPackages = [
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
  for (const p of labPackages) await prisma.labTestPackage.create({ data: p });
  console.log('Lab packages:', labPackages.length);

  const healthPlans = [
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
  for (const hp of healthPlans) await prisma.healthPlan.create({ data: hp });
  console.log('Health plans:', healthPlans.length);

  console.log('Marketplace CMS seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
