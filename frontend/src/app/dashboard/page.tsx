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
          // 检查 public.users 是否存在该用户
          const { data: userRows, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .single();
          if (!userRows && !userError) {
            await supabase.from('users').insert({
              id: user.id,
              email: user.email
            });
          }

          // 检查是否有 workspace，没有则创建默认 personal workspace
          let workspaceId = null;
          let { data: workspaces, error: wsError } = await supabase
            .from('workspaces')
            .select('id')
            .eq('user_id', user.id);
          if ((!workspaces || workspaces.length === 0) && !wsError) {
            // 创建 workspace
            const { data: newWs, error: createError } = await supabase.from('workspaces').insert({
              user_id: user.id,
              name: 'Personal workspace',
              type: 'personal',
              currency: 'CAD'
            }).select('id').single();
            workspaceId = newWs?.id;
          } else if (workspaces && workspaces.length > 0) {
            workspaceId = workspaces[0].id;
          }
          // 跳转到 workspace dashboard
          if (workspaceId) {
            router.replace(`/dashboard/${workspaceId}`);
          }
        }
      }
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
