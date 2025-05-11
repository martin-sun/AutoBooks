'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
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
        
        // 获取用户的工作空间
        const { data: workspaces, error } = await supabase
          .from('workspaces')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true })
          .limit(1);
        
        if (error) {
          console.error('Error fetching workspaces:', error);
          return;
        }
        
        if (workspaces && workspaces.length > 0) {
          setWorkspaceId(workspaces[0].id);
        } else {
          // 如果用户没有工作空间，可能需要创建一个
          console.log('No workspaces found for user');
          
          // 这里可以调用create-workspace Edge Function
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
  );
};

export default DashboardLayout;
