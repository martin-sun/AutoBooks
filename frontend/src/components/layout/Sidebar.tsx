'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MenuItem as MenuItemType, fetchSidebarMenu } from '@/lib/api/sidebar-menu';
import MenuItem from './MenuItem';
// 不再需要 createClient
import WorkspaceSwitcher from '../ui/WorkspaceSwitcher';
import { Building } from 'lucide-react';

interface SidebarProps {
  workspaceId: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ workspaceId, onWorkspaceChange }) => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Directly fetch menu data, no longer need to fetch workspace type
        
        // Fetch menu data
        const menuData = await fetchSidebarMenu(workspaceId);
        setMenuItems(menuData);
      } catch (err) {
        console.error('Error loading sidebar menu:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };
    
    if (workspaceId) {
      loadMenu();
    }
  }, [workspaceId]);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleWorkspaceChange = (newWorkspaceId: string) => {
    if (onWorkspaceChange) {
      onWorkspaceChange(newWorkspaceId);
    } else {
      // If no callback function is provided, directly refresh the page
      window.location.reload();
    }
  };



  return (
    <div className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Sidebar header */}
      <div className="flex flex-col border-b border-gray-200 dark:border-gray-800">
        {/* Workspace switcher */}
        <div className="p-4">
          {!collapsed ? (
            <WorkspaceSwitcher 
              currentWorkspaceId={workspaceId} 
              onWorkspaceChange={handleWorkspaceChange} 
            />
          ) : (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              title="Expand Sidebar"
            >
              <Building size={20} />
            </button>
          )}
        </div>
        
        {/* Collapse/expand button */}
        <div className="flex items-center justify-end px-4 py-2 bg-gray-50 dark:bg-gray-850">
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="11 17 6 12 11 7"></polyline>
                <polyline points="18 17 13 12 18 7"></polyline>
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* 侧边栏内容 */}
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            {error}
          </div>
        ) : collapsed ? (
          // 折叠状态下只显示图标
          <div className="py-2">
            {menuItems.map((item) => (
              <div 
                key={item.id} 
                className="flex justify-center py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
                title={item.name}
              >
                {item.icon && (
                  <div className={`${pathname === item.route ? 'text-blue-500' : ''}`}>
                    {/* 这里可以根据item.icon渲染对应的图标 */}
                    <span>{item.icon.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // 展开状态下显示完整菜单
          <div className="py-2">
            {menuItems.map((item) => (
              <MenuItem 
                key={item.id} 
                item={item} 
                workspaceId={workspaceId}
                isOpen={pathname ? pathname.startsWith(item.route) : false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
