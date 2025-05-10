"use client";
import { useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        const user = data.session.user;
        if (user) {
          // 查询用户的workspace (后端已自动创建)
          let { data: workspaces, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(1);

          if (workspaces && workspaces.length > 0) {
            // 跳转到默认workspace的dashboard
            router.replace(`/dashboard/${workspaces[0].id}`);
          } else {
            // 如果出现异常情况（理论上不应该发生，因为后端会自动创建）
            console.error("No workspace found and backend trigger failed", wsError);
            setLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">Loading...</div>
  );
}
