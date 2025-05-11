import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function DashboardPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
}
