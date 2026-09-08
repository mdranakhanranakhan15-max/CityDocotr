import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthModal } from '@/components/AuthModal';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';

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
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF8FF] text-slate-900 antialiased">
        <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <AuthModal />
            {children}
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

