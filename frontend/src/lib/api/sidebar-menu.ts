import { supabase } from '../supabase-client';

// 菜单项类型定义
export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

export interface SidebarMenuResponse {
  workspace_type: string;
  menu: MenuItem[];
}

/**
 * 获取特定工作空间的侧边栏菜单
 * @param workspaceId 工作空间ID
 * @returns 菜单树结构
 */
export async function fetchSidebarMenu(workspaceId: string): Promise<MenuItem[]> {
  try {
    // 使用共享的Supabase客户端实例
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No active session found');
      return [];
    }
    
    // 获取Supabase URL
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nvzbsstwyavjultjtcuv.supabase.co';
    
    // 调用Edge Function获取菜单数据
    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-sidebar-menu?workspace_id=${workspaceId}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch sidebar menu:', errorData);
      return [];
    }
    
    const data: SidebarMenuResponse = await response.json();
    return data.menu;
  } catch (error) {
    console.error('Error fetching sidebar menu:', error);
    return [];
  }
}
