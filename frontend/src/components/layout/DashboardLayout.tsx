'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { createClient } from '@supabase/supabase-js';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isChangingWorkspace, setIsChangingWorkspace] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchActiveWorkspace = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // 获取当前会话
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }
        
        // 尝试从 URL 中获取工作空间 ID
        const pathname = window.location.pathname;
        const pathParts = pathname.split('/');
        let urlWorkspaceId = null;
        
        // UUID 验证函数
        const isValidUUID = (uuid: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          return uuidRegex.test(uuid);
        };
        
        // 如果 URL 格式是 /dashboard/{workspaceId}/...
        if (pathParts.length >= 3 && pathParts[1] === 'dashboard') {
          const potentialId = pathParts[2];
          // 只有当 ID 是有效的 UUID 时才使用它
          if (isValidUUID(potentialId)) {
            urlWorkspaceId = potentialId;
          } else {
            console.warn(`Invalid workspace ID format in URL: ${potentialId}. Expected UUID format.`);
            // 无效的 UUID 格式，将重定向到用户的默认工作空间
            urlWorkspaceId = null;
          }
        }
        
        // 如果从 URL 获取到了工作空间 ID，验证它是否属于当前用户
        if (urlWorkspaceId) {
          const { data: workspace, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('id', urlWorkspaceId)
            .eq('user_id', session.user.id)
            .single();
          
          if (!wsError && workspace) {
            setWorkspaceId(workspace.id);
            return; // 如果找到了有效的工作空间，直接返回
          }
        }
        
        // 如果 URL 中没有有效的工作空间 ID，获取用户的默认工作空间
        const { data: workspaces, error } = await supabase
          .from('workspaces')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching workspaces:', error);
          console.log('User ID:', session.user.id);
          console.log('Supabase URL:', supabaseUrl);
          
          // Try to fetch workspaces with a more detailed query to debug
          const { data: debugWorkspaces, error: debugError } = await supabase
            .from('workspaces')
            .select('*')
            .limit(5);
            
          console.log('Debug workspaces query result:', { data: debugWorkspaces, error: debugError });
          return;
        }
        
        if (workspaces && workspaces.length > 0) {
          setWorkspaceId(workspaces[0].id);
          
          // 如果 URL 中没有工作空间 ID，更新 URL
          if (!urlWorkspaceId) {
            const basePath = pathname.split('/').slice(0, 2).join('/');
            const newPath = `${basePath}/${workspaces[0].id}`;
            router.push(newPath);
          }
        } else {
          // 如果用户没有工作空间，创建一个
          console.log('No workspaces found for user');
          
          // 调用 create-workspace Edge Function
          const response = await fetch(
            `${supabaseUrl}/functions/v1/create-workspace`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.workspace_id) {
              setWorkspaceId(data.workspace_id);
            }
          } else {
            console.error('Failed to create workspace');
          }
        }
      } catch (err) {
        console.error('Error in fetchActiveWorkspace:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveWorkspace();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">No Workspace Found</h1>
        <p className="text-gray-600 mb-4">We couldn&apos;t find a workspace for your account.</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // 处理工作空间切换
  const handleWorkspaceChange = (newWorkspaceId: string) => {
    if (newWorkspaceId !== workspaceId) {
      setIsChangingWorkspace(true);
      setWorkspaceId(newWorkspaceId);
      
      // Update URL with new workspace ID
      const currentPath = window.location.pathname;
      const basePath = currentPath.split('/').slice(0, 2).join('/');
      const newPath = `${basePath}/${newWorkspaceId}`;
      
      // Use router.push to update the URL without full page reload
      router.push(newPath);
      
      // Short delay before resetting state to give UI time to update
      setTimeout(() => setIsChangingWorkspace(false), 500);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        workspaceId={workspaceId} 
        onWorkspaceChange={handleWorkspaceChange} 
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with fiscal year selector */}
        {!isChangingWorkspace && workspaceId && (
          <DashboardHeader workspaceId={workspaceId} />
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
          {isChangingWorkspace ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
