import { useTranslations } from 'next-intl';
import { MaterialTailwindProvider } from '@/components/providers/MaterialTailwindProvider';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - imported from client component */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 ml-64">
        {/* Top navigation bar - imported from client component */}
        <Navbar />
        
        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
