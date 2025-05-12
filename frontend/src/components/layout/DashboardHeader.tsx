'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiscalYearSelector } from '@/components/ui/FiscalYearSelector';
import { FiscalYear, setupInitialFiscalYear } from '@/lib/api/fiscal-years';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, SettingsIcon, UserIcon } from 'lucide-react';

interface DashboardHeaderProps {
  workspaceId: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ workspaceId }) => {
  const [initializing, setInitializing] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // 初始化财政年度（如果尚未设置）
  useEffect(() => {
    const initializeFiscalYear = async () => {
      if (!workspaceId) return;
      
      try {
        setInitializing(true);
        // 检查并设置初始财政年度
        await setupInitialFiscalYear(workspaceId);
      } catch (error) {
        console.error('Error initializing fiscal year:', error);
      } finally {
        setInitializing(false);
      }
    };
    
    initializeFiscalYear();
  }, [workspaceId]);
  
  // 处理财政年度变更
  const handleFiscalYearChange = (fiscalYear: FiscalYear) => {
    // 触发全局状态更新或事件，通知其他组件财政年度变更
    const fiscalYearChangeEvent = new CustomEvent('fiscalYearChange', { 
      detail: { fiscalYear } 
    });
    window.dispatchEvent(fiscalYearChangeEvent);
  };
  
  // 切换用户菜单显示状态
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        {/* 左侧空间 */}
        <div>
          {/* 可以添加面包屑导航或页面标题 */}
        </div>
        
        {/* 中间空间 - 财政年度选择器 */}
        <div className="flex items-center">
          {!initializing && (
            <FiscalYearSelector 
              workspaceId={workspaceId} 
              onChange={handleFiscalYearChange}
            />
          )}
        </div>
        
        {/* 右侧工具和用户菜单 */}
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/${workspaceId}/settings/fiscal-year`}>
            <Button variant="ghost" size="icon" title="财政年度设置">
              <CalendarIcon className="h-5 w-5" />
            </Button>
          </Link>
          
          <Link href={`/dashboard/${workspaceId}/settings`}>
            <Button variant="ghost" size="icon" title="工作空间设置">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </Link>
          
          <div className="relative">
            <button 
              onClick={toggleUserMenu}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              <UserIcon className="h-5 w-5" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 font-medium border-b border-gray-200">我的账户</div>
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  个人资料
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  账户设置
                </Link>
                <div className="border-t border-gray-200 my-1"></div>
                <Link href="/logout" className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                  退出登录
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
