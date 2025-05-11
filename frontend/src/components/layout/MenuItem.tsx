'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuItem as MenuItemType } from '@/lib/api/sidebar-menu';

// 导入图标
import { 
  ChevronDown, 
  ChevronRight,
  // 下面是菜单项可能使用的图标
  LayoutDashboard,
  Receipt,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  Settings,
  BarChart,
  CreditCard,
  PieChart,
  Package,
  ListChecks,
  Plus,
  List,
  DollarSign,
  FileSpreadsheet,
  ArrowLeftRight,
} from 'lucide-react';

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  'dashboard': <LayoutDashboard size={20} />,
  'receipt': <Receipt size={20} />,
  'account_balance': <Wallet size={20} />,
  'account_balance_wallet': <Wallet size={20} />,
  'trending_up': <TrendingUp size={20} />,
  'trending_down': <TrendingDown size={20} />,
  'description': <FileText size={20} />,
  'settings': <Settings size={20} />,
  'bar_chart': <BarChart size={20} />,
  'credit_card': <CreditCard size={20} />,
  'pie_chart': <PieChart size={20} />,
  'inventory': <Package size={20} />,
  'rule': <ListChecks size={20} />,
  'add': <Plus size={20} />,
  'list': <List size={20} />,
  'money': <DollarSign size={20} />,
  'assessment': <FileSpreadsheet size={20} />,
  'compare_arrows': <ArrowLeftRight size={20} />,
  'request_quote': <FileText size={20} />,
};

interface MenuItemProps {
  item: MenuItemType;
  depth?: number;
  isOpen?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  depth = 0,
  isOpen = false
}) => {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(isOpen);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === item.route;
  
  // 计算缩进
  const paddingLeft = depth * 16 + 16;
  
  // 获取图标
  const icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : null;
  
  const toggleExpand = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      setExpanded(!expanded);
    }
  };
  
  return (
    <>
      <div className={`relative ${hasChildren ? 'cursor-pointer' : ''}`}>
        {hasChildren ? (
          <div 
            className={`flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}`}
            onClick={toggleExpand}
            style={{ paddingLeft }}
          >
            {icon && <span className="mr-2">{icon}</span>}
            <span className="flex-grow">{item.name}</span>
            <span className="ml-auto">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </div>
        ) : (
          <Link 
            href={item.route} 
            className={`flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'bg-gray-100 dark:bg-gray-800 font-medium' : ''}`}
            style={{ paddingLeft }}
          >
            {icon && <span className="mr-2">{icon}</span>}
            <span>{item.name}</span>
          </Link>
        )}
      </div>
      
      {/* 子菜单 */}
      {hasChildren && expanded && (
        <div className="pl-2">
          {item.children?.map((child) => (
            <MenuItem 
              key={child.id} 
              item={child} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </>
  );
};

export default MenuItem;
