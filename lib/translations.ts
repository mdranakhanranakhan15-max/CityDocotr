// ================= CITYDOCTOR i18n DICTIONARY =================
// Flat-key translation dictionary for the full public site (English & Bangla).
// Used via useLanguage() -> t('section.key'). Missing keys fall back to the
// English value (or the raw key) so new UI never renders blank.

export type Lang = 'en' | 'bn';

const en: Record<string, string> = {
  // ---- Top utility bar / Navbar ----
  'nav.hotline': 'Hotline',
  'nav.trust': '100% BMDC Certified Doctors',
  'nav.findDoctors': 'Find Doctors',
  'nav.specialties': 'Specialties',
  'nav.medicine': 'Medicine Delivery',
  'nav.labTests': 'Lab Tests',
  'nav.healthPlans': 'Health Plans',
  'nav.myConsults': 'My Consults & Rx',
  'nav.consultCta': 'Consult in 10 Mins',
  'nav.login': 'Login / Sign Up',
  'nav.logout': 'Logout',
  'nav.dashboard': 'Dashboard',
  'nav.menu': 'Menu',

  // ---- Hero ----
  'hero.badge': 'Bangladesh\u2019s #1 Telehealth Platform',
  'hero.title1': 'Consult Verified Doctors',
  'hero.title2': 'in 10 Minutes.',
  'hero.title3': 'Anytime, Anywhere.',
  'hero.subtitle': 'Connect with 2,500+ BMDC-certified specialists within 10 minutes via encrypted video call. Receive official digital e-prescriptions and order authentic medicines directly to your door.',
  'hero.searchPlaceholder': 'Search for doctors, specialties, or symptoms...',
  'hero.findDoctor': 'Find Doctor',
  'hero.popular': 'Popular:',

  // ---- Hero stats / online badge ----
  'stats.patientsServed': 'Patients Served',
  'stats.bmdcDoctors': 'BMDC Doctors',
  'stats.satisfaction': 'Satisfaction',

  // ---- Departments & Symptoms section ----
  'specialties.eyebrow': '30+ Medical Departments',
  'specialties.titleDepartments': 'Consult by Medical Specialty',
  'specialties.titleSymptoms': 'Choose a Department or Symptom',
  'specialties.subtitleDepartments': 'Select a department to view verified BMDC specialist doctors available right now',
  'specialties.subtitleSymptoms': 'Tell us what you are feeling and we will connect you with the right specialist',
  'specialties.tabDepartments': 'Departments',
  'specialties.tabSymptoms': 'Symptoms',
  'specialties.doctorsAvailable': 'Doctors Available',
  'specialties.specialistsAvailable': 'Specialists Available',

  // ---- Common actions ----
  'common.bookAppointment': 'Book Appointment',
  'common.consultNow': 'Consult Now',
  'common.viewAll': 'View All',
  'common.browseDoctors': 'Browse All 2,500+ Verified Doctors',
  'common.search': 'Search',
  'common.viewProfile': 'View Profile',
  'common.online': 'Online',
  'common.loading': 'Loading…',

  // ---- Doctor cards ----
  'doctor.experience': 'yrs exp',
  'doctor.patients': 'Patients',
  'doctor.reviews': 'Reviews',
  'doctor.fee': 'Consultation Fee',
  'doctor.onlineNow': 'Doctors Online',
  'doctor.verified': 'BMDC Verified',

  // ---- Reviews / testimonials ----
  'reviews.eyebrow': 'Patient Stories',
  'reviews.title': 'What Our Patients Say',
  'reviews.subtitle': 'Real experiences from real patients across Bangladesh',

  // ---- Services ----
  'services.title': 'Everything Your Health Needs, One Platform',
  'services.subtitle': 'Video consultation, medicine delivery, lab tests & health plans — all in one app.',

  // ---- Pharmacy ----
  'pharmacy.eyebrow': 'CityDoctor Express Pharmacy',
  'pharmacy.title': 'Genuine Medicines Delivered in 2-4 Hours',
  'pharmacy.subtitle': 'Get flat 10% discount on every order. Sourced directly from certified pharmaceutical manufacturers like Beximco, Square, Incepta & Renata.',
  'pharmacy.orderNow': 'Order Medicines',

  // ---- Lab tests ----
  'lab.title': 'Home Diagnostic Tests',
  'lab.oldSubtitle': 'Sample collection from home and digital reports within 24 hours.',

  // ---- Health plans ----
  'plans.title': 'CityDoctor Health Membership Plans',
  'plans.subtitle': 'Protect your entire family with unlimited 24/7 doctor consultations, free medicine delivery, and exclusive lab discounts.',

  // ---- Footer ----
  'footer.tagline': 'Healthcare in 10 minutes — online doctor consultation, medicine delivery & home diagnostics across Bangladesh.',
  'footer.quickLinks': 'Quick Links',
  'footer.services': 'Services',
  'footer.contact': 'Contact Us',
  'footer.rights': '© 2026 CityDoctor Healthcare Bangladesh. All rights reserved.',
  'footer.terms': 'Terms & Conditions',
  'footer.privacy': 'Privacy Policy',
  'footer.about': 'About Us',
  'footer.doctors': 'Our Doctors',
  'footer.videoConsult': 'Video Consultation',
  'footer.medicineDelivery': 'Medicine Delivery',
  'footer.diagnosticTests': 'Diagnostic Tests',
  'footer.healthPlans': 'Health Plans',

  // ---- Booking flow ----
  'booking.title': 'Book Your Appointment',
  'booking.selectDate': 'Select Date & Time',
  'booking.patientInfo': 'Patient Information',
  'booking.name': 'Patient Name',
  'booking.phone': 'Phone Number',
  'booking.age': 'Age',
  'booking.confirm': 'Confirm Booking',
  'booking.success': 'Appointment booked successfully!',

  // ---- Trust badges row ----
  'trust.bmdc': '100% BMDC Certified Doctors',
  'trust.eprescription': 'Instant Digital e-Prescription',
  'trust.private': '100% Private & Encrypted',

  // ---- Quick service cards ----
  'services.video.title': 'Video Consult',
  'services.video.desc': 'Connect with specialists in minutes via HD video with digital e-prescriptions.',
  'services.lab.title': 'Home Lab Test',
  'services.lab.desc': 'Trained professionals collect samples from your home. Digital reports in 24 hrs.',
  'services.med.title': 'Medicine Delivery',
  'services.med.desc': 'Order authentic medicines with fast doorstep delivery and flat 10% discount.',
  'services.sub.title': 'Subscription',
  'services.sub.desc': 'Full healthcare packages for your entire family with unlimited consults.',
  'cta.bookNow': 'Book Now',
  'cta.learnMore': 'Learn More',
  'cta.shopNow': 'Shop Now',
  'cta.seePlans': 'See Plans',

  // ---- Doctor search / list section ----
  'search.title': 'Consult Certified BMDC Doctors',
  'search.showing': 'Showing {n} doctors available for video consultation today — avg. response under 4 minutes.',
  'search.onlineOnly': 'Online Now Only',
  'gender.all': 'All',
  'gender.female': 'Female',
  'gender.male': 'Male',
  'sort.label': 'Sort:',
  'sort.recommended': 'Recommended',
  'sort.rating': 'Top Rated',
  'sort.consulted': 'Most Consulted',
  'sort.fee': 'Lowest Fee',
  'search.noDoctors': 'No doctors match the current filters',
  'search.tryReset': 'Try switching off “Online Now Only” or resetting the gender filter to see the full verified directory.',
  'search.resetFilters': 'Reset Filters',

  // ---- Lab tests section ----
  'lab.eyebrow': 'Home Diagnostic Services',
  'lab.heading': 'Accredited Lab Tests with Home Sample Collection',
  'lab.subtitle': 'Certified medical phlebotomist collects blood and urine samples from your doorstep. 100% sterile equipment with digital reports in 24 hours.',
  'lab.freeCollection': 'Free Sample Collection',
  'lab.accredited': 'Accredited Lab Results',
  'lab.mostPopular': 'Most Popular',
  'lab.bookCollection': 'Book Home Collection',
  'lab.feature1': 'Free sample collection from your home',
  'lab.feature2': 'NABL-accredited partner laboratories',
  'lab.feature3': 'Digital report delivered within 24 hours',
  'lab.comprehensive.name': 'Comprehensive Health Checkup',
  'lab.comprehensive.meta': '68 Tests Included',
  'lab.comprehensive.tag': 'Full Body Screening',
  'lab.panel.name': 'Disease Specific Panel',
  'lab.panel.meta': '24 Tests Included',
  'lab.panel.tag': 'Diabetes & Thyroid',
  'lab.heart.name': 'Heart Health Checkup',
  'lab.heart.meta': '18 Tests Included',
  'lab.heart.tag': 'Cardiac Risk Profile',

  // ---- Pharmacy / medicine delivery section extras ----
  'pharmacy.guaranteed': '100% Genuine Guaranteed',
  'pharmacy.freeDelivery': 'Free Delivery over ৳500',
  'pharmacy.code': 'Use Code: CITYDOCTOR10',
  'pharmacy.browseShop': 'Browse Full Medicine Shop',
  'pharmacy.rxTitle': 'Have a Doctor’s Prescription?',
  'pharmacy.rxDesc': 'Simply upload a photo of your prescription. Our licensed pharmacist will verify medicines and deliver directly to your address.',
  'pharmacy.uploadRx': 'Upload Prescription',
  'pharmacy.off': 'OFF',
  'pharmacy.add': '+ Add',
  'pharmacy.added': '✓ Added',

  // ---- Health membership plans section extras ----
  'plans.badge': 'Membership',
  'plans.monthly': 'Monthly',
  'plans.yearly': 'Yearly',
  'plans.save': 'Save 20%',
  'plans.choose': 'Choose This Plan',
  'plans.popular': 'Most Popular Choice',

  // ---- Testimonials section ----
  'testimonials.eyebrow': 'Verified Patient Experiences',
  'testimonials.title': 'Loved by Over 500,000+ Patients',

  // ---- App download banner ----
  'app.eyebrow': 'Mobile App',
  'app.title': 'Get the CityDoctor App on Your Smartphone',
  'app.subtitle': 'Access 24/7 doctors, store health records, and order medicines anywhere in Bangladesh.',
  'app.availableOn': 'Available On',
  'app.downloadOnThe': 'Download On The',

  // ---- Footer links & legal ----
  'footer.brandDesc': 'CityDoctor is Bangladesh’s pioneering digital telehealth ecosystem bringing verified medical care, prescription medicine delivery, and home diagnostic pathology within everyone’s reach.',
  'footer.hotline': '24/7 Hotline: 09612-345678',
  'footer.address': 'Gulshan-1, Dhaka-1212, Bangladesh',
  'footer.headServices': 'Our Services',
  'footer.linkVideoCall': 'Online Doctor Video Call',
  'footer.linkMedicine': 'Doorstep Medicine (10% Off)',
  'footer.linkLab': 'Home Sample Collection',
  'footer.linkPlans': 'Family Health Subscriptions',
  'footer.linkSpecialists': 'Specialist Appointments',
  'footer.headProfessionals': 'Professionals & Trust',
  'footer.linkGeneral': 'General Physician (Medicine)',
  'footer.linkGynae': 'Gynaecology & Pregnancy',
  'footer.linkPeds': 'Pediatrics (Child Health)',
  'footer.linkDerma': 'Dermatology (Skin & Hair)',
  'footer.linkCardio': 'Cardiology & Heart Care',
  'footer.linkPsych': 'Psychiatry & Mental Health',
  'footer.headCompliance': 'Privacy & Compliance',
  'footer.linkHipaa': 'Privacy & HIPAA Security',
  'footer.linkTerms': 'Terms of Consultation',
  'footer.linkRxVerify': 'Prescription Verification',
  'footer.linkCorporate': 'Corporate Health Coverage',
  'footer.bmdcOnly': 'BMDC Certified Doctors Only',
  'footer.disclaimerTitle': 'Medical Disclaimer:',
  'footer.disclaimer': 'CityDoctor provides digital telemedicine consultation for primary and non-emergency health conditions. If you or a family member are experiencing a life-threatening medical emergency (such as severe chest pain, acute respiratory arrest, active bleeding, or loss of consciousness), please dial 999 immediately or proceed to the nearest hospital emergency room.',
  'footer.dghs': 'DGHS Registered',
  'footer.bmdcCompliant': 'BMDC Compliant',
  'footer.ssl': 'SSL Secured Gateway',
};

const bn: Record<string, string> = {
  // ---- টপ ইউটিলিটি বার / নেভবার ----
  'nav.hotline': 'হটলাইন',
  'nav.trust': '১০০% বিএমডিসি সনদপ্রাপ্ত ডাক্তার',
  'nav.findDoctors': 'ডাক্তার খুঁজুন',
  'nav.specialties': 'বিশেষত্ব',
  'nav.medicine': 'ঔষধ ডেলিভারি',
  'nav.labTests': 'ল্যাব টেস্ট',
  'nav.healthPlans': 'হেলথ প্ল্যান',
  'nav.myConsults': 'আমার পরামর্শ ও প্রেসক্রিপশন',
  'nav.consultCta': '১০ মিনিটে পরামর্শ',
  'nav.login': 'লগইন / সাইন আপ',
  'nav.logout': 'লগ আউট',
  'nav.dashboard': 'ড্যাশবোর্ড',
  'nav.menu': 'মেনু',

  // ---- হিরো ----
  'hero.badge': 'বাংলাদেশের #১ টেলিহেলথ প্ল্যাটফর্ম',
  'hero.title1': 'সনদপ্রাপ্ত ডাক্তারের পরামর্শ নিন',
  'hero.title2': '১০ মিনিটেই।',
  'hero.title3': 'যেকোনো সময়, যেকোনো জায়গায়।',
  'hero.subtitle': 'এনক্রিপ্টেড ভিডিও কলের মাধ্যমে ১০ মিনিটের মধ্যে ২,৫০০+ বিএমডিসি-সনদপ্রাপ্ত বিশেষজ্ঞের সাথে কথা বলুন। অফিসিয়াল ডিজিটাল ই-প্রেসক্রিপশন নিন এবং খাঁটি ঔষধ সরাসরি বাসায় অর্ডার করুন।',
  'hero.searchPlaceholder': 'ডাক্তার, বিশেষত্ব বা উপসর্গ খুঁজুন...',
  'hero.findDoctor': 'ডাক্তার খুঁজুন',
  'hero.popular': 'জনপ্রিয়:',

  // ---- হিরো স্ট্যাটস / অনলাইন ব্যাজ ----
  'stats.patientsServed': 'রোগী সেবা পেয়েছেন',
  'stats.bmdcDoctors': 'বিএমডিসি ডাক্তার',
  'stats.satisfaction': 'সন্তুষ্টি',

  // ---- ডিপার্টমেন্ট ও উপসর্গ সেকশন ----
  'specialties.eyebrow': '৩০+ মেডিকেল বিভাগ',
  'specialties.titleDepartments': 'বিশেষত্ব অনুযায়ী পরামর্শ নিন',
  'specialties.titleSymptoms': 'বিভাগ বা উপসর্গ বেছে নিন',
  'specialties.subtitleDepartments': 'এখনই উপলব্ধ সনদপ্রাপ্ত বিশেষজ্ঞ ডাক্তার দেখতে একটি বিভাগ নির্বাচন করুন',
  'specialties.subtitleSymptoms': 'আপনার সমস্যা বলুন, আমরা সঠিক বিশেষজ্ঞের সাথে সংযোগ করিয়ে দেব',
  'specialties.tabDepartments': 'বিভাগসমূহ',
  'specialties.tabSymptoms': 'উপসর্গ',
  'specialties.doctorsAvailable': 'ডাক্তার উপলব্ধ',
  'specialties.specialistsAvailable': 'জন বিশেষজ্ঞ উপলব্ধ',

  // ---- সাধারণ অ্যাকশন ----
  'common.bookAppointment': 'অ্যাপয়েন্টমেন্ট বুক করুন',
  'common.consultNow': 'এখনই পরামর্শ নিন',
  'common.viewAll': 'সব দেখুন',
  'common.browseDoctors': '২,৫০০+ সনদপ্রাপ্ত ডাক্তার দেখুন',
  'common.search': 'খুঁজুন',
  'common.viewProfile': 'প্রোফাইল দেখুন',
  'common.online': 'অনলাইন',
  'common.loading': 'লোড হচ্ছে…',

  // ---- ডাক্তার কার্ড ----
  'doctor.experience': 'বছর অভিজ্ঞতা',
  'doctor.patients': 'রোগী',
  'doctor.reviews': 'রিভিউ',
  'doctor.fee': 'পরামর্শ ফি',
  'doctor.onlineNow': 'ডাক্তার অনলাইনে',
  'doctor.verified': 'বিএমডিসি যাচাইকৃত',

  // ---- রিভিউ / টেস্টিমোনিয়াল ----
  'reviews.eyebrow': 'রোগীদের গল্প',
  'reviews.title': 'আমাদের রোগীরা যা বলেন',
  'reviews.subtitle': 'বাংলাদেশ জুড়ে প্রকৃত রোগীদের প্রকৃত অভিজ্ঞতা',

  // ---- সার্ভিস ----
  'services.title': 'আপনার স্বাস্থ্যের সব চাহিদা, একটি প্ল্যাটফর্মে',
  'services.subtitle': 'ভিডিও পরামর্শ, ঔষধ ডেলিভারি, ল্যাব টেস্ট ও হেলথ প্ল্যান — সবই একটি অ্যাপে।',

  // ---- ফার্মেসি ----
  'pharmacy.eyebrow': 'CityDoctor এক্সপ্রেস ফার্মেসি',
  'pharmacy.title': '২-৪ ঘণ্টায় আসল ওষুধ ডেলিভারি',
  'pharmacy.subtitle': 'প্রতি অর্ডারে ফ্ল্যাট ১০% ছাড়। বেক্সিমকো, স্কয়ার, ইনসেপ্টা ও রেনাটাসহ সনদপ্রাপ্ত ফার্মাসিউটিক্যাল প্রতিষ্ঠান থেকে সরাসরি সংগ্রহ করা হয়।',
  'pharmacy.orderNow': 'ঔষধ অর্ডার করুন',

  // ---- ল্যাব টেস্ট ----
  'lab.title': 'বাসায় ডায়াগনস্টিক টেস্ট',
  'lab.oldSubtitle': 'বাসা থেকে নমুনা সংগ্রহ এবং ২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট।',

  // ---- হেলথ প্ল্যান ----
  'plans.title': 'সিটিডক্টর হেলথ মেম্বারশিপ প্ল্যান',
  'plans.subtitle': 'আনলিমিটেড ২৪/৭ ডাক্তার পরামর্শ, ফ্রি ঔষধ ডেলিভারি এবং ল্যাব টেস্টে বিশেষ ছাড়সহ আপনার পুরো পরিবারকে সুরক্ষিত রাখুন।',

  // ---- ফুটার ----
  'footer.tagline': '১০ মিনিটেই স্বাস্থ্যসেবা — অনলাইন ডাক্তার পরামর্শ, ঔষধ ডেলিভারি ও হোম ডায়াগনস্টিকস সারা বাংলাদেশে।',
  'footer.quickLinks': 'দ্রুত লিংক',
  'footer.services': 'সেবাসমূহ',
  'footer.contact': 'যোগাযোগ করুন',
  'footer.rights': '© ২০২৬ CityDoctor Healthcare Bangladesh. সর্বস্বত্ব সংরক্ষিত।',
  'footer.terms': 'শর্তাবলী',
  'footer.privacy': 'গোপনীয়তা নীতি',
  'footer.about': 'আমাদের সম্পর্কে',
  'footer.doctors': 'আমাদের ডাক্তার',
  'footer.videoConsult': 'ভিডিও পরামর্শ',
  'footer.medicineDelivery': 'ঔষধ ডেলিভারি',
  'footer.diagnosticTests': 'ডায়াগনস্টিক টেস্ট',
  'footer.healthPlans': 'হেলথ প্ল্যান',

  // ---- বুকিং ফ্লো ----
  'booking.title': 'আপনার অ্যাপয়েন্টমেন্ট বুক করুন',
  'booking.selectDate': 'তারিখ ও সময় নির্বাচন করুন',
  'booking.patientInfo': 'রোগীর তথ্য',
  'booking.name': 'রোগীর নাম',
  'booking.phone': 'ফোন নম্বর',
  'booking.age': 'বয়স',
  'booking.confirm': 'বুকিং নিশ্চিত করুন',
  'booking.success': 'অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে!',

  // ---- ট্রাস্ট ব্যাজ সারি ----
  'trust.bmdc': '১০০% বিএমডিসি সনদপ্রাপ্ত ডাক্তার',
  'trust.eprescription': 'ইনস্ট্যান্ট ডিজিটাল ই-প্রেসক্রিপশন',
  'trust.private': '১০০% প্রাইভেট ও এনক্রিপ্টেড',

  // ---- কুইক সার্ভিস কার্ড ----
  'services.video.title': 'ভিডিও পরামর্শ',
  'services.video.desc': 'এইচডি ভিডিওর মাধ্যমে মিনিটেই বিশেষজ্ঞের সাথে সংযোগ করুন, সাথে ডিজিটাল ই-প্রেসক্রিপশন।',
  'services.lab.title': 'হোম ল্যাব টেস্ট',
  'services.lab.desc': 'প্রশিক্ষিত কর্মীরা আপনার বাসা থেকে নমুনা সংগ্রহ করবেন। ২৪ ঘণ্টায় ডিজিটাল রিপোর্ট।',
  'services.med.title': 'ঔষধ ডেলিভারি',
  'services.med.desc': 'দ্রুত বাসায় ডেলিভারি সহ খাঁটি ঔষধ অর্ডার করুন, ফ্ল্যাট ১০% ছাড়।',
  'services.sub.title': 'সাবস্ক্রিপশন',
  'services.sub.desc': 'আনলিমিটেড পরামর্শ সহ আপনার পুরো পরিবারের জন্য সম্পূর্ণ হেলথকেয়ার প্যাকেজ।',
  'cta.bookNow': 'এখনই বুক করুন',
  'cta.learnMore': 'আরও জানুন',
  'cta.shopNow': 'কিনুন',
  'cta.seePlans': 'প্ল্যান দেখুন',

  // ---- ডাক্তার সার্চ / লিস্ট সেকশন ----
  'search.title': 'সনদপ্রাপ্ত বিএমডিসি ডাক্তারের পরামর্শ নিন',
  'search.showing': 'আজ ভিডিও পরামর্শের জন্য {n} জন ডাক্তার উপলব্ধ — গড় সাড়া ৪ মিনিটের কম।',
  'search.onlineOnly': 'শুধু এখন অনলাইনে',
  'gender.all': 'সব',
  'gender.female': 'মহিলা',
  'gender.male': 'পুরুষ',
  'sort.label': 'সাজান:',
  'sort.recommended': 'প্রস্তাবিত',
  'sort.rating': 'সর্বোচ্চ রেটিং',
  'sort.consulted': 'সর্বাধিক পরামর্শ',
  'sort.fee': 'সর্বনিম্ন ফি',
  'search.noDoctors': 'বর্তমান ফিল্টারে কোনো ডাক্তার মেলেনি',
  'search.tryReset': 'সম্পূর্ণ যাচাইকৃত ডাক্তার তালিকা দেখতে "শুধু এখন অনলাইনে" বন্ধ করুন বা লিঙ্গ ফিল্টার রিসেট করুন।',
  'search.resetFilters': 'ফিল্টার রিসেট করুন',

  // ---- ল্যাব টেস্ট সেকশন ----
  'lab.eyebrow': 'হোম ডায়াগনস্টিক সেবা',
  'lab.heading': 'হোম নমুনা সংগ্রহ সহ স্বীকৃত ল্যাব টেস্ট',
  'lab.subtitle': 'সনদপ্রাপ্ত মেডিকেল টেকনিশিয়ান আপনার বাসার দরজা থেকে রক্ত ও প্রস্রাবের নমুনা সংগ্রহ করবেন। ১০০% জীবাণুমুক্ত যন্ত্রপাতি এবং ২৪ ঘণ্টায় ডিজিটাল রিপোর্ট।',
  'lab.freeCollection': 'ফ্রি নমুনা সংগ্রহ',
  'lab.accredited': 'স্বীকৃত ল্যাব রিপোর্ট',
  'lab.mostPopular': 'সবচেয়ে জনপ্রিয়',
  'lab.bookCollection': 'হোম সংগ্রহ বুক করুন',
  'lab.feature1': 'বাসা থেকে ফ্রি নমুনা সংগ্রহ',
  'lab.feature2': 'এনএবিএল-স্বীকৃত পার্টনার ল্যাবরেটরি',
  'lab.feature3': '২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট',
  'lab.comprehensive.name': 'সম্পূর্ণ স্বাস্থ্য পরীক্ষা',
  'lab.comprehensive.meta': '৬৮টি টেস্ট অন্তর্ভুক্ত',
  'lab.comprehensive.tag': 'ফুল বডি স্ক্রিনিং',
  'lab.panel.name': 'রোগ নির্দিষ্ট প্যানেল',
  'lab.panel.meta': '২৪টি টেস্ট অন্তর্ভুক্ত',
  'lab.panel.tag': 'ডায়াবেটিস ও থাইরয়েড',
  'lab.heart.name': 'হার্ট হেলথ চেকআপ',
  'lab.heart.meta': '১৮টি টেস্ট অন্তর্ভুক্ত',
  'lab.heart.tag': 'কার্ডিয়াক রিস্ক প্রোফাইল',

  // ---- ফার্মেসি / ঔষধ ডেলিভারি সেকশন এক্সট্রা ----
  'pharmacy.guaranteed': '১০০% আসল ওষুধের নিশ্চয়তা',
  'pharmacy.freeDelivery': '৳৫০০ টাকার বেশি অর্ডারে ফ্রি ডেলিভারি',
  'pharmacy.code': 'কোড ব্যবহার করুন: CITYDOCTOR10',
  'pharmacy.browseShop': 'সম্পূর্ণ ঔষধ শপ দেখুন',
  'pharmacy.rxTitle': 'ডাক্তারের প্রেসক্রিপশন আছে?',
  'pharmacy.rxDesc': 'আপনার প্রেসক্রিপশনের একটি ছবি আপলোড করুন। আমাদের লাইসেন্সপ্রাপ্ত ফার্মাসিস্ট ওষুধ যাচাই করে সরাসরি আপনার ঠিকানায় ডেলিভারি করবেন।',
  'pharmacy.uploadRx': 'প্রেসক্রিপশন আপলোড করুন',
  'pharmacy.off': 'ছাড়',
  'pharmacy.add': '+ যোগ করুন',
  'pharmacy.added': '✓ যোগ হয়েছে',

  // ---- হেলথ মেম্বারশিপ প্ল্যান সেকশন এক্সট্রা ----
  'plans.badge': 'মেম্বারশিপ',
  'plans.monthly': 'মাসিক',
  'plans.yearly': 'বার্ষিক',
  'plans.save': '২০% সাশ্রয়',
  'plans.choose': 'এই প্ল্যানটি নির্বাচন করুন',
  'plans.popular': 'সবচেয়ে জনপ্রিয় পছন্দ',

  // ---- টেস্টিমোনিয়াল সেকশন ----
  'testimonials.eyebrow': 'যাচাইকৃত রোগীর অভিজ্ঞতা',
  'testimonials.title': '৫,০০,০০০+ মানুষের আস্থা ও ভালোবাসা',

  // ---- অ্যাপ ডাউনলোড ব্যানার ----
  'app.eyebrow': 'মোবাইল অ্যাপ',
  'app.title': 'আপনার স্মার্টফোনে সিটিডক্টর অ্যাপটি ডাউনলোড করুন',
  'app.subtitle': 'সারাদেশে যেকোনো জায়গা থেকে ২৪/৭ ডাক্তার, হেলথ রেকর্ড সংরক্ষণ এবং ঔষধ অর্ডার করুন।',
  'app.availableOn': 'পাবেন এখানে',
  'app.downloadOnThe': 'ডাউনলোড করুন',

  // ---- ফুটার লিংক ও আইনি ----
  'footer.brandDesc': 'সিটিডক্টর বাংলাদেশের অগ্রগামী ডিজিটাল টেলিহেলথ ইকোসিস্টেম — যাচাইকৃত চিকিৎসা সেবা, প্রেসক্রিপশন ঔষধ ডেলিভারি এবং হোম ডায়াগনস্টিক প্যাথলজি সবার নাগালের মধ্যে নিয়ে এসেছে।',
  'footer.hotline': '২৪/৭ হটলাইন: ০৯৬১২-৩৪৫৬৭৮',
  'footer.address': 'গুলশান-১, ঢাকা-১২১২, বাংলাদেশ',
  'footer.headServices': 'আমাদের সেবাসমূহ',
  'footer.linkVideoCall': 'অনলাইন ডাক্তার ভিডিও কল',
  'footer.linkMedicine': 'বাসায় ঔষধ ডেলিভারি (১০% ছাড়)',
  'footer.linkLab': 'বাসা থেকে নমুনা সংগ্রহ',
  'footer.linkPlans': 'ফ্যামিলি হেলথ সাবস্ক্রিপশন',
  'footer.linkSpecialists': 'বিশেষজ্ঞ অ্যাপয়েন্টমেন্ট',
  'footer.headProfessionals': 'বিশেষজ্ঞ ও সুরক্ষা',
  'footer.linkGeneral': 'জেনারেল ফিজিশিয়ান (মেডিসিন)',
  'footer.linkGynae': 'গাইনোকোলজি ও প্রেগন্যান্সি',
  'footer.linkPeds': 'পেডিয়াট্রিক্স (শিশু স্বাস্থ্য)',
  'footer.linkDerma': 'ডার্মাটোলজি (ত্বক ও চুল)',
  'footer.linkCardio': 'কার্ডিওলজি ও হার্ট কেয়ার',
  'footer.linkPsych': 'সাইকিয়াট্রি ও মানসিক স্বাস্থ্য',
  'footer.headCompliance': 'প্রাইভেসি ও পলিসি',
  'footer.linkHipaa': 'প্রাইভেসি ও HIPAA সিকিউরিটি',
  'footer.linkTerms': 'পরামর্শের শর্তাবলী',
  'footer.linkRxVerify': 'প্রেসক্রিপশন যাচাইকরণ',
  'footer.linkCorporate': 'কর্পোরেট হেলথ কভারেজ',
  'footer.bmdcOnly': 'শুধুমাত্র বিএমডিসি সনদপ্রাপ্ত ডাক্তার',
  'footer.disclaimerTitle': 'মেডিকেল ডিসক্লেইমার:',
  'footer.disclaimer': 'সিটিডক্টর প্রাথমিক ও জরুরি নয় এমন স্বাস্থ্য সমস্যার জন্য ডিজিটাল টেলিমেডিসিন পরামর্শ প্রদান করে। আপনার বা পরিবারের কারো প্রাণঘাতী মেডিকেল ইমারজেন্সি (যেমন গুরুতর বুকে ব্যথা, তীব্র শ্বাসকষ্ট, অতিরিক্ত রক্তক্ষরণ বা জ্ঞান হারানো) হলে দয়া করে সাথে সাথে ৯৯৯ নম্বরে কল করুন বা নিকটস্থ হাসপাতালের ইমারজেন্সি বিভাগে যান।',
  'footer.dghs': 'ডিজিএইচএস নিবন্ধিত',
  'footer.bmdcCompliant': 'বিএমডিসি কমপ্লায়েন্ট',
  'footer.ssl': 'এসএসএল সুরক্ষিত গেটওয়ে',
};

export const translations: Record<Lang, Record<string, string>> = { en, bn };

// ============ Department / CMS-name Bangla fallback helper ============
// CMS Department titles are free-text English. When `bn` is active we first
// prefer an explicit `nameBn` field (if the admin saved one), then fall back
// to this curated lookup, then the raw English title.
export const DEPT_NAME_BN: Record<string, string> = {
  // Common symptom labels (Symptom cards / hero popular chips)
  'sexual problems': 'যৌন সমস্যা',
  'period problems': 'মাসিক সমস্যা',
  'fever, cold/flu': 'জ্বর, সর্দি/ফ্লু',
  'fever & flu': 'জ্বর ও ফ্লু',
  'child diseases': 'শিশু রোগ',
  'pregnancy issues': 'গর্ভাবস্থার সমস্যা',
  'pregnancy care': 'গর্ভাবস্থার যত্ন',
  'stomach pain & gas': 'পেট ব্যথা ও গ্যাস',
  'skin & acne': 'ত্বক ও ব্রণ',
  'skin problems': 'ত্বকের সমস্যা',
  'child cough': 'শিশুর কাশি',
  'headache & migraine': 'মাথাব্যথা ও মাইগ্রেন',
  'diabetes care': 'ডায়াবেটিস যত্ন',
  'diabetes & hypertension': 'ডায়াবেটিস ও উচ্চ রক্তচাপ',
  'high blood pressure': 'উচ্চ রক্তচাপ',
  'chest pain': 'বুকে ব্যথা',
  'mental health': 'মানসিক স্বাস্থ্য',

  'general physician': 'জেনারেল ফিজিশিয়ান',
  'general-physician': 'জেনারেল ফিজিশিয়ান',
  medicine: 'মেডিসিন',
  'gynaecology & obs': 'গাইনোকোলজি ও প্রসূতি',
  'gynae-obs': 'গাইনোকোলজি ও প্রসূতি',
  gynaecology: 'গাইনোকোলজি',
  'gynaecology & pregnancy': 'গাইনোকোলজি ও প্রেগন্যান্সি',
  pediatrics: 'শিশু বিভাগ',
  'pediatrics (child health)': 'শিশু রোগ বিভাগ',
  dermatology: 'চর্মরোগ বিভাগ',
  'dermatology (skin & hair)': 'চর্ম ও চুলের রোগ',
  cardiology: 'হৃদরোগ বিভাগ',
  'cardiology & heart care': 'কার্ডিওলজি ও হার্ট কেয়ার',
  psychiatry: 'মানসিক স্বাস্থ্য',
  'psychiatry & mental health': 'সাইকিয়াট্রি ও মানসিক স্বাস্থ্য',
  ent: 'নাক-কান-গলা',
  orthopedics: 'হাড়-জোড়া রোগ',
  orthopedic: 'হাড়-জোড়া রোগ',
  neurology: 'স্নায়ুরোগ বিভাগ',
  'neuro & spine': 'নিউরো ও স্পাইন',
  gastroenterology: 'গ্যাস্ট্রোএন্টারোলজি',
  pulmonology: 'বক্ষব্যাধি (ফুসফুস)',
  nephrology: 'কিডনি বিভাগ',
  endocrinology: 'ডায়াবেটিস ও হরমোন',
  urology: 'ইউরোলজি',
  ophthalmology: 'চক্ষু বিভাগ',
  dentistry: 'ডেন্টাল (দাঁত)',
  oncology: 'ক্যান্সার বিভাগ',
  'physical medicine': 'ফিজিক্যাল মেডিসিন',
  nutrition: 'পুষ্টিবিদ্যা',
};

/** Translate a free-text department/specialty name to Bangla if a match exists. */
export function translateDept(name: string | null | undefined): string | null {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  return DEPT_NAME_BN[key] ?? null;
}

// ============ Free-text homepage string → Bangla lookup ============
// The homepage renders a lot of catalogue/free-text content (plan names &
// features, trust-points, patient review quotes, medicine categories/forms,
// etc.). Those strings live in static arrays AND in the MongoDB CMS, so they
// can't rely on `t()` keys. When Bangla is active we look each one up here
// (exact match) and fall back to the raw English value.
export const UI_TEXT_BN: Record<string, string> = {
  // --- Medicine delivery: categories ---
  All: 'সব',
  'General': 'জেনারেল',
  'Fever & Pain': 'জ্বর ও ব্যথা',
  'Gastric & Acidity': 'গ্যাস্ট্রিক ও এসিডিটি',
  'Vitamins & Supplements': 'ভিটামিন ও সাপ্লিমেন্ট',
  'Respiratory & Allergy': 'শ্বাসকষ্ট ও অ্যালার্জি',
  'Allergy & Cold': 'অ্যালার্জি ও সর্দি',

  // --- Medicine delivery: dosage forms ---
  Tablet: 'ট্যাবলেট',
  Capsule: 'ক্যাপসুল',
  Medicine: 'ঔষধ',

  // --- Lab test feature bullets (also used by CMS rows) ---
  'Free sample collection from your home': 'বাসা থেকে ফ্রি নমুনা সংগ্রহ',
  'NABL-accredited partner laboratories': 'এনএবিএল-স্বীকৃত পার্টনার ল্যাবরেটরি',
  'Digital report delivered within 24 hours': '২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট',

  // --- Health membership plans: names & taglines ---
  'Individual Health Shield': 'একক হেলথ শিল্ড',
  'DocTime Plus Care': 'সিটিডক্টর প্লাস কেয়ার',
  'Family Total Protection': 'ফ্যামিলি টোটাল প্রোটেকশন',
  'Ideal for young professionals & individuals': 'তরুণ পেশাজীবী ও ব্যক্তিদের জন্য উপযুক্ত',
  'Our most popular comprehensive healthcare package': 'আমাদের সবচেয়ে জনপ্রিয় সম্পূর্ণ হেলথকেয়ার প্যাকেজ',
  'Complete medical safety net for parents and children': 'বাবা-মা ও সন্তানদের জন্য সম্পূর্ণ মেডিকেল নিরাপত্তা',

  // --- Health membership plans: features ---
  '6 Free Video Consultations with General Physicians': 'জেনারেল ফিজিশিয়ানের সাথে ৬টি ফ্রি ভিডিও পরামর্শ',
  '10% Flat Discount on all doorstep medicine orders': 'সব বাসায় ঔষধ অর্ডারে ১০% ফ্ল্যাট ছাড়',
  '15% Discount on all home diagnostic lab tests': 'সব হোম ডায়াগনস্টিক ল্যাব টেস্টে ১৫% ছাড়',
  'Digital health records vault with lifetime storage': 'আজীবন স্টোরেজসহ ডিজিটাল হেলথ রেকর্ড ভল্ট',
  'Unlimited Video Consultations with General Physicians': 'জেনারেল ফিজিশিয়ানের সাথে আনলিমিটেড ভিডিও পরামর্শ',
  '4 Free Specialist Doctor Consultations per year': 'প্রতি বছর ৪টি ফ্রি বিশেষজ্ঞ ডাক্তার পরামর্শ',
  '15% Flat Discount on all medicines with free delivery': 'ফ্রি ডেলিভারিসহ সব ঔষধে ১৫% ফ্ল্যাট ছাড়',
  '25% Discount on home diagnostic lab tests': 'হোম ডায়াগনস্টিক ল্যাব টেস্টে ২৫% ছাড়',
  'Priority appointment scheduling & 24/7 hotline access': 'অগ্রাধিকার অ্যাপয়েন্টমেন্ট ও ২৪/৭ হটলাইন সুবিধা',
  'Unlimited 24/7 video consultations with General Physicians': 'জেনারেল ফিজিশিয়ানের সাথে আনলিমিটেড ২৪/৭ ভিডিও পরামর্শ',
  '10 Specialist Doctor consultations across all departments': 'সব বিভাগে ১০টি বিশেষজ্ঞ ডাক্তার পরামর্শ',
  'Covers up to 5 family members (Parents, Spouse & Children)': 'সর্বোচ্চ ৫ জন পরিবারের সদস্য কভার (বাবা-মা, স্ত্রী/স্বামী ও সন্তান)',
  '20% Flat discount on all medicines with free delivery': 'ফ্রি ডেলিভারিসহ সব ঔষধে ২০% ফ্ল্যাট ছাড়',
  'Digital health vault for the whole family': 'পুরো পরিবারের জন্য ডিজিটাল হেলথ ভল্ট',

  // --- Trust / why-choose-us feature cards ---
  '100% BMDC Certified Doctors': '১০০% বিএমডিসি সনদপ্রাপ্ত ডাক্তার',
  'Every doctor on our platform is strictly verified against the Bangladesh Medical & Dental Council registry before onboarding.': 'আমাদের প্ল্যাটফর্মের প্রতিটি ডাক্তার নিয়োগের আগে বাংলাদেশ মেডিকেল অ্যান্ড ডেন্টাল কাউন্সিল রেজিস্ট্রির বিরুদ্ধে কঠোরভাবে যাচাই করা হয়।',
  'Confidential & Encrypted': 'গোপনীয় ও এনক্রিপ্টেড',
  'End-to-end encrypted video streams and private cloud storage for all your medical reports and electronic prescriptions.': 'আপনার সকল মেডিকেল রিপোর্ট ও ইলেকট্রনিক প্রেসক্রিপশনের জন্য এন্ড-টু-এন্ড এনক্রিপ্টেড ভিডিও স্ট্রিম এবং প্রাইভেট ক্লাউড স্টোরেজ।',
  '24/7 Availability Across BD': 'সারাদেশে ২৪/৭ সেবা',
  'Doctors available day and night, even on national holidays. Express medicine delivery active across all major metropolitan areas.': 'জাতীয় ছুটির দিনেও দিনরাত ডাক্তার উপলব্ধ। সব প্রধান মেট্রোপলিটন এলাকায় এক্সপ্রেস ঔষধ ডেলিভারি সচল।',

  // --- Patient review quotes (seeded defaults & CMS identical rows) ---
  '“CityDoctor is a lifesaver for our family. When my 4-year-old had sudden midnight fever, Dr. Rafiqul was online within 6 minutes. The e-prescription was clear and medicine arrived in the morning.”': '“সিটিডক্টর আমাদের পরিবারের জন্য জীবন রক্ষাকারী। আমার ৪ বছরের সন্তানের রাত ১২টায় হঠাৎ জ্বর উঠলে ডা. রফিকুল ৬ মিনিটের মধ্যে অনলাইনে ছিলেন। ই-প্রেসক্রিপশনটি পরিষ্কার ছিল এবং সকালে ওষুধ পৌঁছে যায়।”',
  '“Living outside Dhaka, getting an appointment with a BSMMU doctor used to take weeks. With CityDoctor, we consulted Prof. Mahmudul Alam for my mother’s cardiac checkup right from our living room.”': '“ঢাকার বাইরে থাকায় বিএসএমএমইউ ডাক্তারের অ্যাপয়েন্টমেন্ট পেতে আগে কয়েক সপ্তাহ লেগে যেত। সিটিডক্টরের মাধ্যমে আমরা আমাদের বসার ঘর থেকেই মায়ের হার্ট চেকআপের জন্য অধ্যাপক মাহমুদুল আলমের পরামর্শ নিয়েছি।”',
  '“The home sample collection service for diabetes checkup was so seamless. Phlebotomist came at 7:30 AM in PPE, and I received digital reports by 6 PM. Highly recommended!”': '“ডায়াবেটিস চেকআপের জন্য হোম নমুনা সংগ্রহ সেবাটি ছিল অত্যন্ত সহজ। ফ্লেবোটোমিস্ট পিপিই পরে সকাল ৭:৩০টায় আসেন এবং সন্ধ্যা ৬টার মধ্যে আমি ডিজিটাল রিপোর্ট পেয়ে যাই। সবার কাছে সুপারিশ করব!”',

  // --- Patient review locations / service labels ---
  'Uttara, Dhaka': 'উত্তরা, ঢাকা',
  'Sylhet Sadar': 'সিলেট সদর',
  'Gulshan, Dhaka': 'গুলশান, ঢাকা',
  'Uttara, Dhaka • Pediatrics Consultation': 'উত্তরা, ঢাকা • শিশু বিশেষজ্ঞ পরামর্শ',
  'Sylhet Sadar • Cardiology Review': 'সিলেট সদর • কার্ডিওলজি রিভিউ',
  'Gulshan, Dhaka • Executive Full Body Checkup': 'গুলশান, ঢাকা • সম্পূর্ণ বডি চেকআপ',
};
