'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 处理 Supabase 认证回调
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // 处理认证回调
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        router.push('/auth/signin');
        return;
      }
      
      // 认证成功，重定向到仪表盘
      router.push('/dashboard');
    };
    
    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">处理认证中...</p>
      </div>
    </div>
  );
}
