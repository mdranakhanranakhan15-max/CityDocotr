import React from 'react';

export const metadata = {
  title: 'CityDoctor Patient Portal | My Account',
  description: 'Manage your appointments, prescriptions, and account settings.',
};

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-h-screen overflow-x-hidden">{children}</div>;
}