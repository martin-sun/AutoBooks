// Chart of Accounts API
// Created: 2025-05-11

import { createClient } from '@supabase/supabase-js';

// 定义会计科目表类型
export interface ChartOfAccount {
  id?: string;
  workspace_id: string;
  code?: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  accounts?: Account[];
}

// 定义账户类型
export interface Account {
  id?: string;
  workspace_id: string;
  chart_id: string;
  name: string;
  description?: string;
  opening_balance?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  chart?: ChartOfAccount;
}

// 获取工作空间的会计科目表
export async function fetchChartOfAccounts(workspaceId: string): Promise<ChartOfAccount[]> {
  try {
    console.log(`Fetching chart of accounts for workspace ID: ${workspaceId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 查询会计科目表
    const { data: chartOfAccounts, error: chartError } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('is_deleted', false)
      .order('type')
      .order('name');
    
    if (chartError || !chartOfAccounts) {
      console.error('Error fetching chart of accounts:', chartError);
      throw new Error(chartError?.message || 'Failed to fetch chart of accounts');
    }
    
    console.log(`Successfully fetched ${chartOfAccounts.length} chart of accounts entries`);
    return chartOfAccounts;
  } catch (error) {
    console.error('Error in fetchChartOfAccounts:', error);
    throw error;
  }
}

// 获取特定会计科目的账户
export async function fetchAccounts(chartId: string): Promise<Account[]> {
  try {
    console.log(`Fetching accounts for chart ID: ${chartId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 查询账户
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('chart_id', chartId)
      .eq('is_deleted', false)
      .order('name');
    
    if (accountsError || !accounts) {
      console.error('Error fetching accounts:', accountsError);
      throw new Error(accountsError?.message || 'Failed to fetch accounts');
    }
    
    console.log(`Successfully fetched ${accounts.length} accounts for chart ID: ${chartId}`);
    return accounts;
  } catch (error) {
    console.error('Error in fetchAccounts:', error);
    throw error;
  }
}

// 获取工作空间的所有账户（带会计科目信息）
export async function fetchAllAccounts(workspaceId: string): Promise<Account[]> {
  try {
    console.log(`Fetching all accounts for workspace ID: ${workspaceId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 查询账户及其关联的会计科目
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select(`
        *,
        chart:chart_of_accounts(*)
      `)
      .eq('workspace_id', workspaceId)
      .eq('is_deleted', false)
      .order('name');
    
    if (accountsError || !accounts) {
      console.error('Error fetching all accounts:', accountsError);
      throw new Error(accountsError?.message || 'Failed to fetch all accounts');
    }
    
    console.log(`Successfully fetched ${accounts.length} accounts for workspace ID: ${workspaceId}`);
    return accounts;
  } catch (error) {
    console.error('Error in fetchAllAccounts:', error);
    throw error;
  }
}

// 创建新的会计科目
export async function createChartOfAccount(chartData: ChartOfAccount): Promise<ChartOfAccount> {
  try {
    console.log(`Creating new chart of account: ${chartData.name}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 创建会计科目
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert(chartData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating chart of account:', error);
      throw new Error(error?.message || 'Failed to create chart of account');
    }
    
    console.log(`Successfully created chart of account with ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Error in createChartOfAccount:', error);
    throw error;
  }
}

// 更新会计科目
export async function updateChartOfAccount(chartId: string, chartData: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
  try {
    console.log(`Updating chart of account with ID: ${chartId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 更新会计科目
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update(chartData)
      .eq('id', chartId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating chart of account:', error);
      throw new Error(error?.message || 'Failed to update chart of account');
    }
    
    console.log(`Successfully updated chart of account with ID: ${chartId}`);
    return data;
  } catch (error) {
    console.error('Error in updateChartOfAccount:', error);
    throw error;
  }
}

// 删除会计科目（软删除）
export async function deleteChartOfAccount(chartId: string): Promise<void> {
  try {
    console.log(`Deleting chart of account with ID: ${chartId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 软删除会计科目
    const { error } = await supabase
      .from('chart_of_accounts')
      .update({ is_deleted: true })
      .eq('id', chartId);
    
    if (error) {
      console.error('Error deleting chart of account:', error);
      throw new Error(error.message || 'Failed to delete chart of account');
    }
    
    console.log(`Successfully deleted chart of account with ID: ${chartId}`);
  } catch (error) {
    console.error('Error in deleteChartOfAccount:', error);
    throw error;
  }
}

// 创建新账户
export async function createAccount(accountData: Account): Promise<Account> {
  try {
    console.log(`Creating new account: ${accountData.name}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 创建账户
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error creating account:', error);
      throw new Error(error?.message || 'Failed to create account');
    }
    
    console.log(`Successfully created account with ID: ${data.id}`);
    return data;
  } catch (error) {
    console.error('Error in createAccount:', error);
    throw error;
  }
}

// 更新账户
export async function updateAccount(accountId: string, accountData: Partial<Account>): Promise<Account> {
  try {
    console.log(`Updating account with ID: ${accountId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 更新账户
    const { data, error } = await supabase
      .from('accounts')
      .update(accountData)
      .eq('id', accountId)
      .select()
      .single();
    
    if (error || !data) {
      console.error('Error updating account:', error);
      throw new Error(error?.message || 'Failed to update account');
    }
    
    console.log(`Successfully updated account with ID: ${accountId}`);
    return data;
  } catch (error) {
    console.error('Error in updateAccount:', error);
    throw error;
  }
}

// 删除账户（软删除）
export async function deleteAccount(accountId: string): Promise<void> {
  try {
    console.log(`Deleting account with ID: ${accountId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 软删除账户
    const { error } = await supabase
      .from('accounts')
      .update({ is_deleted: true })
      .eq('id', accountId);
    
    if (error) {
      console.error('Error deleting account:', error);
      throw new Error(error.message || 'Failed to delete account');
    }
    
    console.log(`Successfully deleted account with ID: ${accountId}`);
  } catch (error) {
    console.error('Error in deleteAccount:', error);
    throw error;
  }
}

// 创建默认会计科目表
export async function createDefaultChartOfAccounts(workspaceId: string, workspaceType: 'personal' | 'business'): Promise<void> {
  try {
    console.log(`Creating default chart of accounts for ${workspaceType} workspace: ${workspaceId}`);
    
    // 创建 Supabase 客户端
    const supabaseUrl = "https://nvzbsstwyavjultjtcuv.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52emJzc3R3eWF2anVsdGp0Y3V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwNTMzNTAsImV4cCI6MjA2MTYyOTM1MH0.gVLJFmOBPLpmxtbrHMt4MSsjmu9gvFKoV3491BqKYqM";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 根据工作空间类型创建不同的默认会计科目表
    if (workspaceType === 'personal') {
      // 个人工作空间默认会计科目
      const personalDefaultCharts = [
        // 资产类
        { workspace_id: workspaceId, code: '1000', name: '现金和银行账户', type: 'asset', description: '现金和银行账户资产' },
        { workspace_id: workspaceId, code: '1100', name: '投资', type: 'asset', description: '投资资产' },
        { workspace_id: workspaceId, code: '1200', name: '应收账款', type: 'asset', description: '应收账款资产' },
        { workspace_id: workspaceId, code: '1300', name: '个人资产', type: 'asset', description: '个人资产' },
        
        // 负债类
        { workspace_id: workspaceId, code: '2000', name: '信用卡', type: 'liability', description: '信用卡负债' },
        { workspace_id: workspaceId, code: '2100', name: '贷款', type: 'liability', description: '贷款负债' },
        { workspace_id: workspaceId, code: '2200', name: '其他负债', type: 'liability', description: '其他负债' },
        
        // 权益类
        { workspace_id: workspaceId, code: '3000', name: '所有者权益', type: 'equity', description: '所有者权益' },
        
        // 收入类
        { workspace_id: workspaceId, code: '4000', name: '工资收入', type: 'income', description: '工资收入' },
        { workspace_id: workspaceId, code: '4100', name: '投资收入', type: 'income', description: '投资收入' },
        { workspace_id: workspaceId, code: '4200', name: '其他收入', type: 'income', description: '其他收入' },
        
        // 支出类
        { workspace_id: workspaceId, code: '5000', name: '住房支出', type: 'expense', description: '住房相关支出' },
        { workspace_id: workspaceId, code: '5100', name: '交通支出', type: 'expense', description: '交通相关支出' },
        { workspace_id: workspaceId, code: '5200', name: '食品支出', type: 'expense', description: '食品相关支出' },
        { workspace_id: workspaceId, code: '5300', name: '娱乐支出', type: 'expense', description: '娱乐相关支出' },
        { workspace_id: workspaceId, code: '5400', name: '医疗支出', type: 'expense', description: '医疗相关支出' },
        { workspace_id: workspaceId, code: '5500', name: '教育支出', type: 'expense', description: '教育相关支出' },
        { workspace_id: workspaceId, code: '5600', name: '其他支出', type: 'expense', description: '其他支出' }
      ];
      
      // 批量插入个人默认会计科目
      const { error: chartsError } = await supabase
        .from('chart_of_accounts')
        .insert(personalDefaultCharts);
      
      if (chartsError) {
        console.error('Error creating personal default chart of accounts:', chartsError);
        throw new Error(chartsError.message || 'Failed to create personal default chart of accounts');
      }
      
    } else if (workspaceType === 'business') {
      // 商业工作空间默认会计科目
      const businessDefaultCharts = [
        // 资产类
        { workspace_id: workspaceId, code: '1000', name: '现金和银行账户', type: 'asset', description: '现金和银行账户资产' },
        { workspace_id: workspaceId, code: '1100', name: '应收账款', type: 'asset', description: '应收账款资产' },
        { workspace_id: workspaceId, code: '1200', name: '库存', type: 'asset', description: '库存资产' },
        { workspace_id: workspaceId, code: '1300', name: '固定资产', type: 'asset', description: '固定资产' },
        { workspace_id: workspaceId, code: '1400', name: '无形资产', type: 'asset', description: '无形资产' },
        { workspace_id: workspaceId, code: '1500', name: '其他资产', type: 'asset', description: '其他资产' },
        
        // 负债类
        { workspace_id: workspaceId, code: '2000', name: '应付账款', type: 'liability', description: '应付账款负债' },
        { workspace_id: workspaceId, code: '2100', name: '信用卡', type: 'liability', description: '信用卡负债' },
        { workspace_id: workspaceId, code: '2200', name: '贷款', type: 'liability', description: '贷款负债' },
        { workspace_id: workspaceId, code: '2300', name: '应付税款', type: 'liability', description: '应付税款' },
        { workspace_id: workspaceId, code: '2400', name: '其他负债', type: 'liability', description: '其他负债' },
        
        // 权益类
        { workspace_id: workspaceId, code: '3000', name: '所有者权益', type: 'equity', description: '所有者权益' },
        { workspace_id: workspaceId, code: '3100', name: '留存收益', type: 'equity', description: '留存收益' },
        
        // 收入类
        { workspace_id: workspaceId, code: '4000', name: '销售收入', type: 'income', description: '销售收入' },
        { workspace_id: workspaceId, code: '4100', name: '服务收入', type: 'income', description: '服务收入' },
        { workspace_id: workspaceId, code: '4200', name: '其他收入', type: 'income', description: '其他收入' },
        
        // 支出类
        { workspace_id: workspaceId, code: '5000', name: '销售成本', type: 'expense', description: '销售成本' },
        { workspace_id: workspaceId, code: '5100', name: '工资支出', type: 'expense', description: '工资支出' },
        { workspace_id: workspaceId, code: '5200', name: '租金支出', type: 'expense', description: '租金支出' },
        { workspace_id: workspaceId, code: '5300', name: '水电支出', type: 'expense', description: '水电支出' },
        { workspace_id: workspaceId, code: '5400', name: '办公支出', type: 'expense', description: '办公支出' },
        { workspace_id: workspaceId, code: '5500', name: '市场营销', type: 'expense', description: '市场营销支出' },
        { workspace_id: workspaceId, code: '5600', name: '专业服务', type: 'expense', description: '专业服务支出' },
        { workspace_id: workspaceId, code: '5700', name: '税费支出', type: 'expense', description: '税费支出' },
        { workspace_id: workspaceId, code: '5800', name: '折旧摊销', type: 'expense', description: '折旧摊销支出' },
        { workspace_id: workspaceId, code: '5900', name: '其他支出', type: 'expense', description: '其他支出' }
      ];
      
      // 批量插入商业默认会计科目
      const { error: chartsError } = await supabase
        .from('chart_of_accounts')
        .insert(businessDefaultCharts);
      
      if (chartsError) {
        console.error('Error creating business default chart of accounts:', chartsError);
        throw new Error(chartsError.message || 'Failed to create business default chart of accounts');
      }
    }
    
    console.log(`Successfully created default chart of accounts for ${workspaceType} workspace: ${workspaceId}`);
  } catch (error) {
    console.error('Error in createDefaultChartOfAccounts:', error);
    throw error;
  }
}
