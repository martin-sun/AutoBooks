import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Receipt, 
  ShoppingCart, 
  Calculator, 
  Building, 
  Users, 
  BarChart, 
  Settings 
} from 'lucide-react';

// Sidebar navigation items
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sales & Payments', href: '/dashboard/sales', icon: Receipt },
  { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingCart },
  { name: 'Accounting', href: '/dashboard/accounting', icon: Calculator },
  { name: 'Banking', href: '/dashboard/banking', icon: Building },
  { name: 'Payroll', href: '/dashboard/payroll', icon: Users },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">AutoBooks</h1>
        </div>
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.name}>
                <Link 
                  href={item.href}
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
