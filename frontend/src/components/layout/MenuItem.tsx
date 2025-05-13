"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuItem as MenuItemType } from "@/lib/api/sidebar-menu";

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
  Users,
  Truck,
  CheckSquare,
  Upload,
  FolderTree,
  Calendar,
  BookOpen,
  ShoppingCart,
  Edit,
  Building,
  User,
  PiggyBank,
  Heart,
  Gift,
  Landmark,
  Clock,
  History,
  Tag,
  Bot,
  Target,
  Briefcase,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  // Original icons
  dashboard: <LayoutDashboard size={20} />,
  receipt: <Receipt size={20} />,
  account_balance: <Wallet size={20} />,
  account_balance_wallet: <Wallet size={20} />,
  trending_up: <TrendingUp size={20} />,
  trending_down: <TrendingDown size={20} />,
  description: <FileText size={20} />,
  settings: <Settings size={20} />,
  bar_chart: <BarChart size={20} />,
  credit_card: <CreditCard size={20} />,
  pie_chart: <PieChart size={20} />,
  inventory: <Package size={20} />,
  rule: <ListChecks size={20} />,
  add: <Plus size={20} />,
  list: <List size={20} />,
  money: <DollarSign size={20} />,
  assessment: <FileSpreadsheet size={20} />,
  compare_arrows: <ArrowLeftRight size={20} />,
  request_quote: <FileText size={20} />,

  // New icons for updated sidebar
  LayoutDashboard: <LayoutDashboard size={20} />,
  Receipt: <Receipt size={20} />,
  Wallet: <Wallet size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  TrendingDown: <TrendingDown size={20} />,
  FileText: <FileText size={20} />,
  Settings: <Settings size={20} />,
  BarChart: <BarChart size={20} />,
  CreditCard: <CreditCard size={20} />,
  PieChart: <PieChart size={20} />,
  Package: <Package size={20} />,
  List: <List size={20} />,
  DollarSign: <DollarSign size={20} />,
  FileSpreadsheet: <FileSpreadsheet size={20} />,
  ArrowLeftRight: <ArrowLeftRight size={20} />,
  Users: <Users size={20} />,
  Truck: <Truck size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Upload: <Upload size={20} />,
  FolderTree: <FolderTree size={20} />,
  Calendar: <Calendar size={20} />,
  BookOpen: <BookOpen size={20} />,
  ShoppingCart: <ShoppingCart size={20} />,
  Edit: <Edit size={20} />,
  Building: <Building size={20} />,
  User: <User size={20} />,
  PiggyBank: <PiggyBank size={20} />,
  Heart: <Heart size={20} />,
  Gift: <Gift size={20} />,
  Landmark: <Landmark size={20} />,
  Clock: <Clock size={20} />,
  History: <History size={20} />,
  Tag: <Tag size={20} />,
  Bot: <Bot size={20} />,
  Target: <Target size={20} />,
  Briefcase: <Briefcase size={20} />,
  ArrowUpCircle: <ArrowUpCircle size={20} />,
  ArrowDownCircle: <ArrowDownCircle size={20} />,
  Plus: <Plus size={20} />,
};

interface MenuItemProps {
  item: MenuItemType;
  workspaceId: string;
  depth?: number;
  isOpen?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  workspaceId,
  depth = 0,
  isOpen = false,
}) => {
  // 处理路由中的占位符
  const processRoute = (route: string) => {
    if (!workspaceId) return route;

    // 替换各种可能的占位符格式
    return route
      .replace(":workspace_id", workspaceId)
      .replace("{workspace_id}", workspaceId)
      .replace("%7Bworkspace_id%7D", workspaceId);
  };
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
      <div className={`relative ${hasChildren ? "cursor-pointer" : ""}`}>
        {hasChildren ? (
          <div
            className={`flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isActive ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""
            }`}
            onClick={toggleExpand}
            style={{ paddingLeft }}
          >
            {icon && <span className="mr-2">{icon}</span>}
            <span className="flex-grow">{item.name}</span>
            <span className="ml-auto">
              {expanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          </div>
        ) : (
          <Link
            href={processRoute(item.route)}
            className={`flex items-center py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 ${
              isActive ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""
            }`}
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
              workspaceId={workspaceId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default MenuItem;
