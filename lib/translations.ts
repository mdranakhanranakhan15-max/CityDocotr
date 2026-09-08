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
  'lab.subtitle': 'Sample collection from home and digital reports within 24 hours.',

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
  'lab.subtitle': 'বাসা থেকে নমুনা সংগ্রহ এবং ২৪ ঘণ্টার মধ্যে ডিজিটাল রিপোর্ট।',

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
};

export const translations: Record<Lang, Record<string, string>> = { en, bn };
