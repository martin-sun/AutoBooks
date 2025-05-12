import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 定义工作空间类型
export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'business';
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

// 创建 Supabase 客户端
const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
const supabase = createClient(supabaseUrl, supabaseKey);

// 工作空间钩子
export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentWorkspace = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取当前用户
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setError('未登录或无法获取用户信息');
          return;
        }

        // 获取用户的工作空间
        const { data: workspaces, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(1);

        if (workspaceError) {
          setError('获取工作空间失败');
          return;
        }

        if (workspaces && workspaces.length > 0) {
          setWorkspace(workspaces[0]);
        } else {
          setError('未找到工作空间');
        }
      } catch (err) {
        console.error('Error in useWorkspace:', err);
        setError('获取工作空间时出错');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentWorkspace();
  }, []);

  return { workspace, loading, error };
}
