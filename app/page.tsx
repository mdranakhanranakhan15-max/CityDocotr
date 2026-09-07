import type { Metadata } from 'next';
import CityDoctorLandingPage from './home-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'CityDoctor | Healthcare in 10 Minutes — Online Doctor Consultation & Telehealth',
  description:
    'Connect with 2,500+ BMDC-verified specialist doctors online within 10 minutes. HD video consultations, digital e-prescriptions, doorstep medicine delivery and home diagnostic tests.',
};

export default function Page() {
  return <CityDoctorLandingPage />;
}

