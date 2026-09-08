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
  'pharmacy.subtitle': 'Order authentic medicines with a valid e-prescription and get them delivered to your doorstep.',
  'pharmacy.orderNow': 'Order Medicines',

  // ---- Lab tests ----
  'lab.title': 'Home Diagnostic Tests',
  'lab.oldSubtitle': 'Sample collection from home and digital reports within 24 hours.',

  // ---- Health plans ----
  'plans.title': 'Affordable Health Plans for Every Family',
  'plans.subtitle': 'Subscribe once and consult anytime — discounts on medicines and lab tests included.',

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
  'pharmacy.title': 'খাঁটি ঔষধ ২-৪ ঘণ্টায় ডেলিভারি',
  'pharmacy.subtitle': 'বৈধ ই-প্রেসক্রিপশন সহ খাঁটি ঔষধ অর্ডার করুন এবং বাসায় ডেলিভারি পান।',
  'pharmacy.orderNow': 'ঔষধ অর্ডার করুন',

  // ---- ল্যাব টেস্ট ----
  'lab.title': 'বাসায় ডায়াগনস্টিক টেস্ট',
  'lab.oldSubtitle': 'বাসা থেকে নমুনা সংগ্রহ এবং ২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট।',

  // ---- হেলথ প্ল্যান ----
  'plans.title': 'প্রতিটি পরিবারের জন্য সাশ্রয়ী হেলথ প্ল্যান',
  'plans.subtitle': 'একবার সাবস্ক্রাইব করুন, যেকোনো সময় পরামর্শ নিন — ঔষধ ও ল্যাব টেস্টে ছাড় সহ।',

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
  'lab.feature1': 'আপনার বাসা থেকে ফ্রি নমুনা সংগ্রহ',
  'lab.feature2': 'এনএবিএল-স্বীকৃত পার্টনার ল্যাবরেটরি',
  'lab.feature3': '২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট ডেলিভারি',
  'lab.comprehensive.name': 'সম্পূর্ণ স্বাস্থ্য পরীক্ষা',
  'lab.comprehensive.meta': '৬৮টি টেস্ট অন্তর্ভুক্ত',
  'lab.comprehensive.tag': 'ফুল বডি স্ক্রিনিং',
  'lab.panel.name': 'রোগ নির্দিষ্ট প্যানেল',
  'lab.panel.meta': '২৪টি টেস্ট অন্তর্ভুক্ত',
  'lab.panel.tag': 'ডায়াবেটিস ও থাইরয়েড',
  'lab.heart.name': 'হার্ট হেলথ চেকআপ',
  'lab.heart.meta': '১৮টি টেস্ট অন্তর্ভুক্ত',
  'lab.heart.tag': 'কার্ডিয়াক রিস্ক প্রোফাইল',
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

