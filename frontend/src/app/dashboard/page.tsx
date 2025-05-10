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
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) {
        router.replace("/register");
      }
      setLoading(false);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200">Loading...</div>;
  }

  if (!session) {
    return null; // 跳转中
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-blue-600 text-center">Welcome to AutoBooks Dashboard</h1>
        <p className="text-center text-gray-700 dark:text-gray-200">
          你已成功登录，接下来可以管理你的账本和工作空间。
        </p>
        <div className="flex flex-col items-center gap-2">
          <span className="text-gray-500 dark:text-gray-400 text-sm">当前用户：</span>
          <span className="font-mono text-blue-700 dark:text-blue-300">{session.user.email}</span>
        </div>
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
