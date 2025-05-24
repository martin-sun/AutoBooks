import { createClient } from '@supabase/supabase-js';

// 使用环境变量初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 创建单例Supabase客户端实例
// 使用默认配置，避免类型错误
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// 添加错误处理辅助函数
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error:', error);
  
  if (error?.code === '42P17') {
    return '数据库策略错误，请联系管理员。我们正在修复RLS策略递归问题。';
  }
  
  return error?.message || '发生未知错误，请稍后再试';
};

export { supabase };
