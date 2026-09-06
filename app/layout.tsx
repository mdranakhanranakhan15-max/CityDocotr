import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export const metadata: Metadata = {
  title: 'CityDoctor | Instant Online Doctor Consultation & Telehealth',
  description: 'Connect with 1800+ BMDC certified specialist doctors online in under 10 minutes. Video consultations, home diagnostic tests, and digital prescriptions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-600 selection:text-white">
        <AuthProvider>
          <AuthModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

