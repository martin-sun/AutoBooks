"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import type { Session } from "@supabase/supabase-js";

interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'business';
  currency: string;
  // Add other workspace properties as needed
}

export default function WorkspaceDashboardPage() {
  const router = useRouter();
  const params = useParams();
  // Add null check and ensure workspace_id is a string
  const workspaceId = params?.workspace_id ? (Array.isArray(params.workspace_id) ? params.workspace_id[0] : params.workspace_id as string) : null;
  const [session, setSession] = useState<Session | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Early return if workspaceId is not valid
    if (!workspaceId) {
      router.replace("/dashboard");
      return;
    }
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.replace("/register");
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (!data.session) {
        router.replace("/register");
      } else {
        // 拉取 workspace 信息
        const { data: ws, error } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();
        if (!ws || error) {
          router.replace("/dashboard"); // workspace 不存在，跳回dashboard主页
        } else {
          setWorkspace(ws);
        }
      }
      setLoading(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, workspaceId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">Loading...</div>;
  }
  if (!session || !workspace) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600 text-center">{workspace.name} Dashboard</h1>
        <p className="text-center text-gray-700 dark:text-gray-200">
          Workspace ID: <span className="font-mono text-blue-700 dark:text-blue-300">{workspace.id}</span>
        </p>
        <p className="text-center text-gray-500 dark:text-gray-400">
          类型: {workspace.type} | 货币: {workspace.currency}
        </p>
        <button
          className="mt-4 w-full py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/register");
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
