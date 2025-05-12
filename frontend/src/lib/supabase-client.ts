import { createClient } from '@supabase/supabase-js';

// 使用环境变量初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 创建单例Supabase客户端实例
const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
