"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/register");
      }
    });
    
    supabase.auth.getSession().then(async ({ data }) => {
      // Check if session exists
      if (!data.session) {
        router.replace("/register");
      } else {
        const user = data.session.user;
        if (user) {
          // 查询用户的workspace (后端已自动创建)
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1);

          if (workspaces && workspaces.length > 0) {
            // 跳转到默认workspace的dashboard
            router.replace(`/dashboard/${workspaces[0].id}`);
          } else {
            // 如果没有找到workspace，调用Edge Function创建一个
            console.log("No workspace found, calling Edge Function to create one");
            try {
              // 打印supabaseUrl以检查其值
              console.log("Supabase URL:", supabaseUrl);
              
              const { data: sessionData } = await supabase.auth.getSession();
              const token = sessionData.session?.access_token;
              
              if (!token) {
                console.error("No access token available");
                setLoading(false);
                return;
              }
              
              // 打印完整的请求URL和token（部分隐藏）
              const functionUrl = `${supabaseUrl}/functions/v1/create-workspace`;
              console.log("Function URL:", functionUrl);
              console.log("Token available:", !!token, "Token prefix:", token.substring(0, 10) + '...');
              
              // 尝试使用完整URL
              try {
                const response = await fetch(functionUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                
                // 检查响应状态
                console.log("Response status:", response.status);
                
                const result = await response.json();
                console.log("Response data:", result);
                
                if (response.ok && result.workspace_id) {
                  // 创建成功，跳转到新创建的workspace
                  console.log("Workspace created successfully", result);
                  router.replace(`/dashboard/${result.workspace_id}`);
                } else {
                  // 创建失败
                  console.error("Failed to create workspace", result);
                  setLoading(false);
                }
              } catch (fetchError) {
                console.error("Fetch error details:", fetchError);
                setLoading(false);
              }
            } catch (error) {
              console.error("Error calling create-workspace function", error);
              setLoading(false);
            }
          }
        }
      }
    }).catch(err => {
      console.error("Error checking session:", err);
      setLoading(false);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">
      {isLoading ? 'Loading...' : 'No workspace found. Please contact support.'}
    </div>
  );
}
