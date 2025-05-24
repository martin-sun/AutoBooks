import { createClient } from '@supabase/supabase-js';

// 创建 Supabase 客户端实例
// 注意：这些环境变量需要在 .env.local 文件中定义
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 创建客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 认证相关辅助函数
export const auth = {
  // 使用邮箱链接登录
  signInWithEmail: async (email: string) => {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
  
  // 使用 Google 登录
  signInWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
  
  // 退出登录
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  // 获取当前会话
  getSession: async () => {
    return await supabase.auth.getSession();
  },
  
  // 获取当前用户
  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};

// 导出 Supabase 类型
export type { Session, User } from '@supabase/supabase-js';
