import React from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export const metadata = {
  title: 'DocTime Admin Dashboard | Telehealth Control Panel',
  description: 'Manage doctors, appointments, and telehealth platform metrics',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100">
      {/* Spacious Sidebar */}
      <AdminSidebar />

      {/* Main Content Area — full remaining width, edge-to-edge */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <main className="flex-1 w-full overflow-y-auto p-8 lg:p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}

