import React from 'react';

export const metadata = {
  title: 'CityDoctor Doctor Portal | Telehealth Console',
  description: 'Secure doctor dashboard for consultations, prescriptions, and appointments.',
};

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-h-screen overflow-x-hidden">{children}</div>;
}