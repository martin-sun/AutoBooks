import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations();
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">{t('app.name')}</h1>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/dashboard" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('navigation.dashboard')}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/chart-of-accounts" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('navigation.chartOfAccounts')}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/accounts" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('navigation.accounts')}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/transactions" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('navigation.transactions')}
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/reports" 
                className="block px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                {t('navigation.reports')}
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      
      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div>
            {/* 面包屑导航 */}
            <nav className="text-sm">
              <span className="text-gray-500">Dashboard</span>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 工作空间切换器 */}
            <div className="relative">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span>Workspace</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            
            {/* 用户菜单 */}
            <div className="relative">
              <button className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
                <span>User</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        {/* 页面内容 */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
